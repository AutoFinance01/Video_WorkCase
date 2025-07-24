class AudioVisualizer {
    constructor() {
        this.canvas = document.getElementById('audioCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mouse = { x: 0, y: 0 };
        this.lastTime = 0;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.audioInitialized = false;
        this.bassEnergy = 0;
        this.midEnergy = 0;
        this.trebleEnergy = 0;
        this.energyHistory = [];

        // 配色
        this.colors = {
            primary: '#111111',
            accent1: '#FF5F5F',
            accent2: '#5FBDFF',
            accent3: '#FFDE59',
            accent4: '#9D4EDD',
            accent5: '#4EDD98',
            highlight: '#ffffff'
        };

        // 图片相关属性
        this.images = [];
        this.loadedImages = 0;
        this.currentImageIndex = 0;
        this.nextImageIndex = 1;
        this.transitionProgress = 0;
        this.transitionSpeed = 0.005; // 调整过渡速度
        this.transitionActive = false;
        this.transitionDelay = 3000; // 改为3秒轮换
        this.lastTransitionTime = 0;

        this.resize();
        this.loadImages();
        this.initAudio();
        this.initBackgroundControls();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    loadImages() {
        // 图片路径数组 - 使用正确的jpg格式
        const imagePaths = [
            'image/Timeline 2_01_02_55_22.jpg',
            'image/Timeline 2_01_03_00_09.jpg',
            'image/Timeline 2_01_04_05_07.jpg',
            'image/Timeline 2_01_13_07_15.jpg',
            'image/Timeline 2_01_42_16_18.jpg',
            'image/Timeline 2_01_37_58_07.jpg',
            'image/Timeline 2_01_01_35_02.jpg',
            'image/Timeline 2_01_00_46_21.jpg',
            'image/Timeline 2_01_00_22_17.jpg',
            'image/Timeline 2_01_09_30_02.jpg'
        ];

        // 加载所有图片
        imagePaths.forEach(path => {
            const img = new Image();
            img.onload = () => {
                this.loadedImages++;
                if (this.loadedImages === imagePaths.length) {
                    // 所有图片加载完成，开始动画
                    this.animate(0);
                }
            };
            img.onerror = () => {
                console.error('图片加载失败:', path);
                this.loadedImages++;
                if (this.loadedImages === imagePaths.length) {
                    // 即使有图片加载失败，也开始动画
                    this.animate(0);
                }
            };
            img.src = path;
            this.images.push(img);
        });
    }

    initAudio() {
        // 等待音频元素加载
        document.addEventListener('DOMContentLoaded', () => {
            const audioElement = document.getElementById('backgroundMusic');

            if (audioElement) {
                // 当音频可以播放时初始化音频分析器
                audioElement.addEventListener('canplay', () => {
                    if (!this.audioInitialized) {
                        try {
                            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                            const source = this.audioContext.createMediaElementSource(audioElement);
                            this.analyser = this.audioContext.createAnalyser();

                            // 配置分析器
                            this.analyser.fftSize = 256;
                            const bufferLength = this.analyser.frequencyBinCount;
                            this.dataArray = new Uint8Array(bufferLength);

                            // 连接节点
                            source.connect(this.analyser);
                            this.analyser.connect(this.audioContext.destination);

                            this.audioInitialized = true;
                            console.log('音频分析器初始化成功');
                        } catch (e) {
                            console.error('初始化音频分析器失败:', e);
                        }
                    }
                });

                // 监听播放状态变化
                audioElement.addEventListener('play', () => {
                    if (this.audioContext && this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                });
            }
        });
    }

    getRandomColor() {
        const colors = [
            this.colors.accent1,
            this.colors.accent2,
            this.colors.accent3,
            this.colors.accent4,
            this.colors.accent5
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    analyzeAudio() {
        if (!this.analyser || !this.dataArray) return;

        // 获取频率数据
        this.analyser.getByteFrequencyData(this.dataArray);

        // 简化为只计算低频能量
        const bassEnd = 10;
        let bassSum = 0;

        // 计算低频能量
        for (let i = 0; i < bassEnd; i++) {
            bassSum += this.dataArray[i];
        }

        // 归一化能量值
        this.bassEnergy = bassSum / (bassEnd * 255);
        
        // 简单平滑处理
        this.energyHistory.push(this.bassEnergy);
        if (this.energyHistory.length > 5) {
            this.energyHistory.shift();
        }
        
        // 计算平均值
        this.bassEnergy = this.energyHistory.reduce((sum, val) => sum + val, 0) / this.energyHistory.length;
    }

    animate(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 分析音频
        this.analyzeAudio();

        // 处理图片切换
        this.handleImageTransition(timestamp);

        // 绘制背景图片
        this.drawBackgroundImages();

        // 绘制音乐可视化效果
        this.drawMusicVisualizer(timestamp);

        // 绘制鼠标交互
        this.drawMouseInteraction();

        requestAnimationFrame((time) => this.animate(time));
    }

    handleImageTransition(timestamp) {
        // 检查是否需要开始新的过渡
        if (!this.transitionActive && timestamp - this.lastTransitionTime > this.transitionDelay) {
            this.transitionActive = true;
            this.transitionProgress = 0;
            this.currentImageIndex = this.nextImageIndex;
            this.nextImageIndex = (this.nextImageIndex + 1) % this.images.length;
            
            // 更新序号显示
            this.updateImageIndicator();
        }

        // 更新过渡进度 - 使用缓动函数使过渡更加自然
        if (this.transitionActive) {
            // 使用更慢的过渡速度
            this.transitionProgress += this.transitionSpeed * 0.7;
            
            // 应用缓动函数 - 先慢后快再慢
            const easedProgress = this.easeInOutCubic(this.transitionProgress);
            this.transitionProgress = easedProgress;

            if (this.transitionProgress >= 1) {
                this.transitionActive = false;
                this.transitionProgress = 0;
                this.lastTransitionTime = timestamp;
            }
        }
    }
    
    // 缓动函数 - 使过渡更加自然
    easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    drawBackgroundImages() {
        if (this.images.length === 0) return;

        // 获取当前图片和下一张图片
        const currentImage = this.images[this.currentImageIndex];
        const nextImage = this.images[this.nextImageIndex];

        if (!currentImage || !nextImage) return;

        // 计算图片缩放和位置，使其覆盖整个画布
        const drawImage = (img, opacity, isNext = false) => {
            if (!img.complete) return;

            const canvasRatio = this.canvas.width / this.canvas.height;
            const imgRatio = img.width / img.height;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (canvasRatio > imgRatio) {
                // 画布比图片更宽
                drawWidth = this.canvas.width;
                drawHeight = drawWidth / imgRatio;
                offsetX = 0;
                offsetY = (this.canvas.height - drawHeight) / 2;
            } else {
                // 画布比图片更窄
                drawHeight = this.canvas.height;
                drawWidth = drawHeight * imgRatio;
                offsetX = (this.canvas.width - drawWidth) / 2;
                offsetY = 0;
            }

            // 应用音频能量效果
            const zoomFactor = 1 + this.bassEnergy * 0.05;
            // 为下一张图片添加额外的缩放效果，使过渡更加动态
            const transitionZoom = isNext ? (1 + this.transitionProgress * 0.03) : (1 - this.transitionProgress * 0.01);
            const zoomedWidth = drawWidth * zoomFactor * transitionZoom;
            const zoomedHeight = drawHeight * zoomFactor * transitionZoom;
            const zoomOffsetX = (drawWidth - zoomedWidth) / 2;
            const zoomOffsetY = (drawHeight - zoomedHeight) / 2;

            // 设置透明度
            this.ctx.globalAlpha = opacity;

            // 绘制图片
            this.ctx.drawImage(
                img,
                offsetX + zoomOffsetX,
                offsetY + zoomOffsetY,
                zoomedWidth,
                zoomedHeight
            );

            // 重置透明度
            this.ctx.globalAlpha = 1;
        };

        // 绘制当前图片
        if (this.transitionActive) {
            // 添加模糊效果，使过渡更加平滑
            if (this.transitionProgress > 0.1 && this.transitionProgress < 0.9) {
                this.ctx.filter = `blur(${Math.sin(this.transitionProgress * Math.PI) * 5}px)`;
            } else {
                this.ctx.filter = 'none';
            }
            
            drawImage(currentImage, 1 - this.transitionProgress);
            drawImage(nextImage, this.transitionProgress, true);
            
            // 重置滤镜
            this.ctx.filter = 'none';
        } else {
            drawImage(currentImage, 1);
        }

        // 添加暗色叠加层，增强视觉效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMusicVisualizer(timestamp) {
        if (!this.analyser || !this.dataArray) return;
        const time = timestamp * 0.001;
        
        // 简化后只绘制波形线
        this.drawWaveform(time);
    }

    drawWaveform(time) {
        if (!this.dataArray) return;

        // 创建波形数据
        this.analyser.getByteTimeDomainData(this.dataArray);

        const sliceWidth = this.canvas.width / this.dataArray.length;
        const waveHeight = 50 + this.bassEnergy * 50;
        const centerY = this.canvas.height * 0.5;

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';

        // 创建渐变
        const gradient = this.ctx.createLinearGradient(0, centerY - waveHeight, 0, centerY + waveHeight);
        gradient.addColorStop(0, this.hexToRgba(this.colors.accent2, 0.7));
        gradient.addColorStop(0.5, this.hexToRgba(this.colors.accent5, 0.7));
        gradient.addColorStop(1, this.hexToRgba(this.colors.accent1, 0.7));

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = this.colors.accent5;
        this.ctx.shadowBlur = 10;

        this.ctx.beginPath();

        for (let i = 0; i < this.dataArray.length; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = centerY + (v - 1) * waveHeight;
            const x = i * sliceWidth;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    drawMouseInteraction() {
        const mouseX = this.mouse.x;
        const mouseY = this.mouse.y;

        if (mouseX === 0 && mouseY === 0) return;

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';

        // 简化的鼠标交互效果
        this.ctx.beginPath();
        this.ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.highlight;
        this.ctx.fill();

        this.ctx.restore();
    }

    initBackgroundControls() {
        // 直接初始化，因为脚本在body底部加载
        const initControls = () => {
            const prevBtn = document.getElementById('bgPrevBtn');
            const nextBtn = document.getElementById('bgNextBtn');

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.previousImage();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.nextImage();
                });
            }
        };

        // 如果DOM已经加载完成，直接初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initControls);
        } else {
            initControls();
        }
    }

    previousImage() {
        if (this.images.length === 0) return;
        
        // 停止当前过渡
        this.transitionActive = false;
        this.transitionProgress = 0;
        
        // 切换到上一张图片
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.nextImageIndex = (this.currentImageIndex + 1) % this.images.length;
        
        // 重置过渡时间
        this.lastTransitionTime = performance.now();
        
        // 添加点击反馈效果
        this.addClickFeedback();
    }

    nextImage() {
        if (this.images.length === 0) return;
        
        // 停止当前过渡
        this.transitionActive = false;
        this.transitionProgress = 0;
        
        // 切换到下一张图片
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.nextImageIndex = (this.currentImageIndex + 1) % this.images.length;
        
        // 重置过渡时间
        this.lastTransitionTime = performance.now();
        
        // 添加点击反馈效果
        this.addClickFeedback();
    }

    updateImageIndicator() {
        // 序号指示器已移除，此方法保留以防其他地方调用
        return;
    }

    addClickFeedback() {
        // 添加简单的视觉反馈效果
        const canvas = this.canvas;
        const ctx = this.ctx;
        
        // 创建一个短暂的闪烁效果
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // 短暂延迟后清除效果
        setTimeout(() => {
            // 效果会在下一帧自动清除
        }, 50);
    }

    hexToRgba(hex, opacity) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
}

// 初始化音频可视化
document.addEventListener('DOMContentLoaded', function() {
    new AudioVisualizer();
});