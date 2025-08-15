
# K8S故障恢复

## 块存储数据恢复

通过`kubesphere`找到`pvc`卷对应的`ceph`块名

![](http://188.36.4.115/api/project/file/attachment/FqOs1kbM5b0UXwYaFjcF13zYJPQd?imageMogr2/auto-orient&e=1743559144&token=VXu2kld82Q4CEhnpUzweXRgby4RUyIfxr11qICVo:sa04XZt0DRCOJC2mmg1Vpba7reU)

![](http://188.36.4.115/api/project/file/attachment/FlQvQhIjy22lr6jEwmQqJgx7ePA7?imageMogr2/auto-orient&e=1743559144&token=VXu2kld82Q4CEhnpUzweXRgby4RUyIfxr11qICVo:_zosJF_895JgoVT8BLZCM948Oz8)

### 通过rbd查看块

```bash
rbd ls kubernetes | grep csi-vol-38e9b38b-8880-4484-8ff4-5c12e77fbe2b
```

### 挂rbd块到服务器本地

```bash
rbd map kubernetes/csi-vol-38e9b38b-8880-4484-8ff4-5c12e77fbe2b
mkdir /opt/fips_v
mount /dev/rbd0 /opt/fips_v/
cd /opt/fips_v/
```

### 卸载rbd卷

```bash
umount /opt/fips_v/
rbd unmap kubernetes/csi-vol-38e9b38b-8880-4484-8ff4-5c12e77fbe2b
```

## 从RBD恢复与PV、PVC的绑定

确保`RBD`镜像没有问题后可以恢复`PVC`。

在 `Kubernetes` 中，**PVC（PersistentVolumeClaim）和 PV（PersistentVolume）可以分开创建，且完全可以先创建 PV 再创建 PVC**。这是 `Kubernetes` 静态供给（Static Provisioning）存储的标准流程，尤其适用于从备份恢复数据的场景。以下是具体操作步骤和注意事项：

---

### 1. 恢复流程概述

1. **先创建 PV**：从备份的 `PV YAML` 定义创建 `PV`，确保其状态为 `Available`。
2. **再创建 PVC**：创建 `PVC` 时，通过匹配规则（如 `storageClassName`、`accessModes`、`容量` 或标签选择器）绑定到已存在的 `PV`。
3. **绑定验证**：确认 `PVC` 与 `PV` 成功绑定，状态为 `Bound`。

---

### 2. 详细操作步骤

#### 步骤 1：创建 PV（从备份恢复）
• **编辑备份的 PV YAML**：  
  确保以下字段正确（关键字段已标出）：
  ```yaml
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: restored-pv  # 建议修改名称，避免与现有 PV 冲突
    annotations:
      # 如果有旧 PVC 的绑定记录，需删除 claimRef
  spec:
    capacity:
      storage: 10Gi    # 必须与 PVC 请求的容量匹配
    accessModes:
      - ReadWriteOnce  # 必须与 PVC 的 accessModes 匹配
    storageClassName: ""  # 明确指定存储类（如果原 PV 有，需保持一致）
    persistentVolumeReclaimPolicy: Retain  # 确保回收策略为 Retain
    # 以下配置根据存储类型调整（如 Ceph RBD、NFS 等）
    csi: # 这部分存储驱动的配置要与先前一致
      driver: rbd.csi.ceph.com
      volumeHandle: kubernetes/csi-vol-38e9b38b-8880-4484-8ff4-5c12e77fbe2b  
      volumeAttributes:
        clusterID: ceph-cluster
        ...
  ```
  • **关键修改点**：  
    ◦ 删除 `claimRef` 字段（如果存在），否则 PV 会处于 `Released` 状态，无法被新 PVC 绑定。
    ◦ 确认 `storageClassName` 是否与后续 PVC 一致（若原 PV 使用特定 StorageClass，需保持一致）。

• **创建 PV**：
  ```bash
  kubectl create -f restored-pv.yaml
  ```

• **验证 PV 状态**：
  ```bash
  kubectl get pv
  ```
  输出应为 `STATUS: Available`。

---

#### 步骤 2：创建 PVC（绑定到 PV）
• **创建 PVC YAML**：  
  ```yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: restored-pvc
    namespace: fips-dev  # 确保命名空间与 Pod 一致
  spec:
    accessModes:
      - ReadWriteOnce     # 必须与 PV 的 accessModes 完全一致
    resources:
      requests:
        storage: 10Gi     # 必须小于等于 PV 的容量
    storageClassName: ""  # 与 PV 的 storageClassName 一致（如果是空字符串，需显式设置为空）
    # 可选：使用 selector 精确绑定到特定 PV
    selector:
      matchLabels:
        pv-purpose: jenkins-data  # 如果 PV 有自定义标签，可在此指定
  ```
  • **关键匹配规则**：  
    PVC 会通过以下条件自动绑定到 PV：  
    1. `storageClassName` 一致  
    2. `accessModes` 包含 PVC 所需模式  
    3. `storage` 容量满足 PVC 请求  

• **创建 PVC**：
  ```bash
  kubectl create -f restored-pvc.yaml
  ```

• **验证 PVC 状态**：
  ```bash
  kubectl get pvc -n fips-dev
  ```
  输出应为 `STATUS: Bound`，且 `VOLUME` 列显示绑定的 PV 名称。

---

### 3. 绑定失败的常见原因
如果 PVC 未绑定到预期的 PV，检查以下配置：
1. **`storageClassName` 不匹配**：  
   • 如果 PV 的 `storageClassName` 为空，PVC 的 `storageClassName` 必须显式设置为空字符串（`storageClassName: ""`），否则会尝试动态供给。
2. **容量不匹配**：  
   PVC 请求的 `storage` 必须小于或等于 PV 的容量。
3. **`accessModes` 不兼容**：  
   PVC 的 `accessModes` 必须是 PV 的 `accessModes` 的子集。
4. **PV 处于 `Released` 状态**：  
   旧 PV 可能残留 `claimRef`，需编辑 PV 删除该字段。

---

### 4. 手动强制绑定（可选）
如果希望 PVC 精确绑定到某个 PV（即使容量、模式不完全匹配），可以通过以下方式强制绑定：  
1. **在 PVC 中指定 PV 名称**：  
   ```yaml
   spec:
     volumeName: restored-pv  # 直接指定 PV 名称
   ```
2. **删除 PV 的 `claimRef`**：  
   ```bash
   kubectl edit pv restored-pv
   ```
   删除 `spec.claimRef` 字段，使 PV 状态恢复为 `Available`。

---

### 关键注意事项
• **不要删除底层存储**：确保 PV 对应的底层存储（如 Ceph RBD 镜像）未被删除。
• **避免重复绑定**：一个 PV 只能绑定一个 PVC，反之亦然。
• **回收策略为 Retain**：确保 PV 的 `persistentVolumeReclaimPolicy` 为 `Retain`，防止误删数据。