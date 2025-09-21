declare module 'youtube-captions-scraper' {
  interface Caption {
    start: number;
    dur: number;
    text: string;
  }

  export function getSubtitles(options: { videoID: string; lang?: string }): Promise<Caption[]>;
}