#!/bin/bash

echo "开始视频压缩优化..."
echo "原始视频大小："
du -sh videos/

# 创建压缩后的视频目录
mkdir -p videos_compressed/commercial
mkdir -p videos_compressed/music

# 使用ffmpeg压缩视频（如果系统有的话）
if command -v ffmpeg &> /dev/null; then
    echo "使用ffmpeg压缩视频..."
    
    # 压缩商业视频
    for video in videos/commercial/*.mp4; do
        if [ -f "$video" ]; then
            filename=$(basename "$video")
            echo "压缩: $filename"
            ffmpeg -i "$video" -vcodec libx264 -crf 28 -preset medium -vf scale=1280:720 -acodec aac -b:a 128k "videos_compressed/commercial/$filename" -y
        fi
    done
    
    # 压缩音乐视频
    for video in videos/music/*.mp4; do
        if [ -f "$video" ]; then
            filename=$(basename "$video")
            echo "压缩: $filename"
            ffmpeg -i "$video" -vcodec libx264 -crf 28 -preset medium -vf scale=1280:720 -acodec aac -b:a 128k "videos_compressed/music/$filename" -y
        fi
    done
    
    echo "压缩完成！"
    echo "压缩后视频大小："
    du -sh videos_compressed/
    
else
    echo "未找到ffmpeg，请先安装："
    echo "brew install ffmpeg"
    echo ""
    echo "或者使用在线工具压缩视频："
    echo "1. https://www.freeconvert.com/video-compressor"
    echo "2. https://www.media.io/video-compressor.html"
    echo "3. https://www.videosmaller.com/"
    echo ""
    echo "建议压缩参数："
    echo "- 分辨率: 720p (1280x720)"
    echo "- 码率: 1-2 Mbps"
    echo "- 格式: MP4 (H.264)"
fi