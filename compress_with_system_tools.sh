#!/bin/bash

echo "🎬 使用系统工具压缩视频"
echo "========================"
echo ""

echo "📊 当前视频文件："
echo "《珠玉》MV.mp4: $(ls -lh videos/music/《珠玉》MV.mp4 | awk '{print $5}')"
echo "速威克匹克球拍.mp4.mp4: $(ls -lh videos/commercial/速威克匹克球拍.mp4.mp4 | awk '{print $5}')"
echo "cowboy4.mp4: $(ls -lh videos/commercial/cowboy4.mp4 | awk '{print $5}')"
echo ""

echo "🛠️ 压缩方案："
echo ""
echo "方案1: 使用QuickTime Player (推荐)"
echo "1. 打开Finder，进入 videos/music/ 目录"
echo "2. 双击《珠玉》MV.mp4用QuickTime Player打开"
echo "3. 菜单栏：文件 → 导出为 → 720p..."
echo "4. 保存到 videos_compressed/music/ 目录"
echo "5. 重复处理其他视频文件"
echo ""

echo "方案2: 使用在线工具"
echo "1. 访问: https://www.videosmaller.com/"
echo "2. 上传《珠玉》MV.mp4"
echo "3. 选择压缩质量: 中等"
echo "4. 下载压缩后的文件"
echo "5. 重复处理其他视频"
echo ""

echo "方案3: 使用iMovie"
echo "1. 打开iMovie应用"
echo "2. 创建新项目，导入视频"
echo "3. 文件 → 共享 → 文件..."
echo "4. 选择720p质量导出"
echo ""

echo "🎯 压缩目标："
echo "- 《珠玉》MV: 147MB → 15-20MB"
echo "- 速威克匹克球拍: 25MB → 5-8MB"
echo "- cowboy4: 11MB → 3-5MB"
echo "- 总计: 183MB → 25-35MB"
echo ""

echo "📁 请将压缩后的文件保存到："
echo "- videos_compressed/music/"
echo "- videos_compressed/commercial/"

# 创建目录
mkdir -p videos_compressed/music
mkdir -p videos_compressed/commercial

echo ""
echo "✅ 压缩目录已创建完成！"
echo "请选择上述任一方案进行视频压缩。"