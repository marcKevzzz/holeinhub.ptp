export function autoplayVideo(video) {
  if (video && !video.hasAttribute('data-intro-pending') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.play().catch(() => {});
  }
}

export function finishHeroIntro(video) {
  video?.removeAttribute('data-intro-pending');
  autoplayVideo(video);
}
