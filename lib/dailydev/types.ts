export type DailyDevProfile = {
  id: string;
  handle?: string;
  name?: string;
};

export type DailyDevPost = {
  id: string;
  title: string;
  url: string;
  tags: string[];
  source?: string;
  publishedAt?: string;
};
