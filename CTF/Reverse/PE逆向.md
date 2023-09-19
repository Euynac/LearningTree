# 概念
PE（Portable Execute）文件被称为可移植的执行体（可执行文件），常见的可执行文件有EXE、DLL、OCX、SYS、COM格式文件，PE文件是微软Windows平台操作系统上的可执行程序文件。  PE文件能被Windows平台的操作系统解释并执行，因此有固定的文件格式。PE 文件格式被组织为一个线性的数据流，它由一个MS-DOS 头部开始，接着是一个实模式的程序残余以及一个PE 文件标志，这之后紧接着PE文件头和可选头部。这些之后是所有的段头部，段头部之后跟随着所有的段实体。文件的结束处是一些其它的区域，其中是一些混杂的信息，包括重分配信息、符号表信息、行号信息以及字串表数据。

OEP (Original Entry Point)  refers to the point in the code where the program starts executing.