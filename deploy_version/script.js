document.addEventListener('DOMContentLoaded', function() {
    // 背景音乐控制 - 简化版
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicToggle = document.getElementById('musicToggle');
    const playIcon = musicToggle.querySelector('.play-icon');
    const pauseIcon = musicToggle.querySelector('.pause-icon');

    let isPlaying = false;

    // 尝试自动播放背景音乐
    backgroundMusic.play().then(() => {
        isPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }).catch(e => {
        console.log('自动播放失败，需要用户交互:', e);
        // 自动播放失败时，保持默认状态
    });

    // 音乐控制功能
    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            backgroundMusic.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            isPlaying = false;
        } else {
            backgroundMusic.play().catch(e => console.log('音频播放失败:', e));
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            isPlaying = true;
        }
    });

    // 设置音量
    backgroundMusic.volume = 0.3;

    // 视频功能
    const videoCards = document.querySelectorAll('.video-card');

    // 视频卡片点击处理
    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video');
            const title = card.querySelector('.video-title').textContent;

            if (videoSrc) {
                openVideoModal(videoSrc, title);
            }
        });

        // 设置视频缩略图和预览
        const videoPreview = card.querySelector('.video-preview');
        if (videoPreview) {
            // 加载视频元数据并设置最佳封面
            videoPreview.addEventListener('loadedmetadata', () => {
                // 获取视频源路径
                const videoSrc = videoPreview.querySelector('source').getAttribute('src');

                // 为特定视频设置特定时间点
                if (videoSrc.includes('cowboy4')) {
                    videoPreview.currentTime = 3; // 设置为视频开始后3秒
                } else {
                    const duration = videoPreview.duration;
                    videoPreview.currentTime = duration * 0.3; // 设置为视频30%处
                }

                // 存储设置的时间点
                videoPreview.addEventListener('timeupdate', function onTimeUpdate() {
                    videoPreview.dataset.previewTime = videoPreview.currentTime;
                    videoPreview.removeEventListener('timeupdate', onTimeUpdate);
                }, {once: true});
            });

            videoPreview.addEventListener('loadeddata', () => {
                videoPreview.classList.add('loaded');
            });

            videoPreview.addEventListener('error', () => {
                videoPreview.style.display = 'none';
                videoPreview.classList.remove('loaded');
                const placeholder = card.querySelector('.video-placeholder');
                if (placeholder) {
                    placeholder.style.opacity = '1';
                }
            });

            // Hover to play preview
            card.addEventListener('mouseenter', () => {
                if (videoPreview.classList.contains('loaded')) {
                    videoPreview.currentTime = 0;
                    videoPreview.play().catch(() => {
                        // Video might not be ready
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                if (videoPreview.classList.contains('loaded')) {
                    videoPreview.pause();

                    // 获取视频源路径
                    const videoSrc = videoPreview.querySelector('source').getAttribute('src');

                    // 为特定视频设置特定时间点
                    if (videoSrc.includes('cowboy4')) {
                        videoPreview.currentTime = 3; // 设置为视频开始后3秒
                    } else if (videoPreview.dataset.previewTime) {
                        videoPreview.currentTime = parseFloat(videoPreview.dataset.previewTime);
                    } else {
                        videoPreview.currentTime = videoPreview.duration * 0.3;
                    }
                }
            });

            // Load the video
            videoPreview.load();
        }
    });

    // 简化的视频模态框功能
    function openVideoModal(videoSrc, title) {
        // 打开视频时暂停背景音乐
        if (isPlaying) {
            backgroundMusic.pause();
        }

        let modal = document.querySelector('.video-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'video-modal';
            modal.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal-content">
                        <button class="modal-close">&times;</button>
                        <video class="modal-video" controls>
                            <source type="video/mp4">
                        </video>
                        <h3 class="modal-title"></h3>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // 添加简化的模态框样式
            const modalStyles = document.createElement('style');
            modalStyles.textContent = `
                .video-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: none;
                }
                .modal-backdrop {
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal-content {
                    max-width: 90vw;
                    max-height: 90vh;
                    position: relative;
                    border-radius: 16px;
                    overflow: hidden;
                }
                .modal-video {
                    width: 100%;
                    height: auto;
                    max-height: 80vh;
                }
                .modal-close {
                    position: absolute;
                    top: -50px;
                    right: 0;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    z-index: 10001;
                }
                .modal-title {
                    color: white;
                    text-align: center;
                    margin-top: 1rem;
                }
            `;
            document.head.appendChild(modalStyles);

            // 添加关闭功能
            modal.querySelector('.modal-close').addEventListener('click', closeVideoModal);
        }

        // 设置视频源和标题
        const video = modal.querySelector('.modal-video source');
        const modalTitle = modal.querySelector('.modal-title');
        video.src = videoSrc;
        modalTitle.textContent = title;

        // 重新加载视频
        modal.querySelector('.modal-video').load();

        // 显示模态框
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        const modal = document.querySelector('.video-modal');
        if (modal) {
            modal.querySelector('.modal-video').pause();
            modal.style.display = 'none';
            document.body.style.overflow = '';

            // 关闭视频时恢复背景音乐
            if (isPlaying) {
                backgroundMusic.play().catch(e => console.log('音频恢复失败:', e));
            }
        }
    }

    // 背景切换功能已移至 audio-visualizer.js 中处理，避免冲突

    // 简化的平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({behavior: 'smooth'});
            }
        });
    });
});