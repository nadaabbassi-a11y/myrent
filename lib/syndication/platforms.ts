export type QuebecPlatformId =
  | "facebook_marketplace"
  | "kijiji"
  | "lespac"
  | "duproprio"
  | "kangalou"
  | "logisquebec"
  | "centris";

export type SyndicationStatus = "pending" | "published";

export interface QuebecPlatform {
  id: QuebecPlatformId;
  nameKey: string;
  descriptionKey: string;
  publishUrl: string;
  color: string;
  brokerOnly?: boolean;
  setupGuideKey?: string;
}

export const QUEBEC_PLATFORMS: QuebecPlatform[] = [
  {
    id: "facebook_marketplace",
    nameKey: "syndication.platforms.facebook",
    descriptionKey: "syndication.platforms.facebookDesc",
    publishUrl: "https://www.facebook.com/marketplace/create/rental",
    color: "#1877F2",
    setupGuideKey: "syndication.platforms.facebookGuide",
  },
  {
    id: "kijiji",
    nameKey: "syndication.platforms.kijiji",
    descriptionKey: "syndication.platforms.kijijiDesc",
    publishUrl: "https://www.kijiji.ca/p-post-ad.html?categoryId=37",
    color: "#373373",
  },
  {
    id: "lespac",
    nameKey: "syndication.platforms.lespac",
    descriptionKey: "syndication.platforms.lespacDesc",
    publishUrl: "https://www.lespac.com/publication",
    color: "#E31937",
  },
  {
    id: "duproprio",
    nameKey: "syndication.platforms.duproprio",
    descriptionKey: "syndication.platforms.duproprioDesc",
    publishUrl: "https://duproprio.com/fr/inscrire-un-logement",
    color: "#00A651",
  },
  {
    id: "kangalou",
    nameKey: "syndication.platforms.kangalou",
    descriptionKey: "syndication.platforms.kangalouDesc",
    publishUrl: "https://www.kangalou.com/fr/proprietaire/publier",
    color: "#FF6B35",
  },
  {
    id: "logisquebec",
    nameKey: "syndication.platforms.logisquebec",
    descriptionKey: "syndication.platforms.logisquebecDesc",
    publishUrl: "https://www.logisquebec.com/fr/proprietaires",
    color: "#0066CC",
  },
  {
    id: "centris",
    nameKey: "syndication.platforms.centris",
    descriptionKey: "syndication.platforms.centrisDesc",
    publishUrl: "https://www.centris.ca/",
    color: "#C4122E",
    brokerOnly: true,
  },
];

export function getPlatformById(id: string): QuebecPlatform | undefined {
  return QUEBEC_PLATFORMS.find((p) => p.id === id);
}
