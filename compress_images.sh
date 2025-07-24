#!/bin/bash
cd image/

echo "开始批量压缩图片..."

for file in *.png; do
    if [ -f "$file" ]; then
        # 获取文件名（不含扩展名）
        filename="${file%.*}"
        # 压缩为JPEG格式，质量70%，最大宽度1200px
        sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 70 "$file" --out "${filename}.jpg"
        echo "已压缩: $file -> ${filename}.jpg"
    fi
done

echo "压缩完成！"
echo "原始PNG文件大小："
du -sh *.png | head -3
echo "压缩后JPEG文件大小："
du -sh *.jpg | head -3