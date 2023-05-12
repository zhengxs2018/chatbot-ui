export type SiteData = {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: string;
  author: string;
  copyright: string
};

export const siteData: SiteData = {
  title: import.meta.env.SITE_TITLE,
  titleTemplate: import.meta.env.SITE_TITLE_TEMPLATE,
  description: import.meta.env.SITE_DESCRIPTION,
  keywords: import.meta.env.SITE_KEYWORDS,
  author: import.meta.env.SITE_AUTHOR,
  copyright: import.meta.env.SITE_COPYRIGHT
};
