export interface SiteSettings {
  logo_url: string | null;
  hero_slogan: string;
  hero_media_url: string | null;
  about_title: string;
  about_content: string;
  address: string;
  phone?: string;
  work_hours: string;
  map_embed_url: string;
  whatsapp_phone?: string;
  whatsapp_default_message: string;
  seo_title: string;
  seo_description: string;
  seo_og_image_url: string | null;
}

export interface SocialMedia {
  id: number;
  type: string;
  url: string;
  name: string | null;
}

export interface Advantage {
  id: number;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface Review {
  id: number;
  author_name: string;
  author_photo_url: string | null;
  rating: number;
  source: string;
  text: string;
  created_at: string;
  order: number;
}

export interface ZoneFeature {
  id: number;
  icon: string;
  text: string;
  order: number;
}

export interface GalleryImage {
  id: number;
  image_url: string | null;
  caption: string;
  order: number;
}

export interface Zone {
  id: number;
  name: string;
  description: string;
  cover_image_url: string | null;
  video_tour_url: string | null;
  order: number;
  features: ZoneFeature[];
}

export interface ZoneDetail extends Zone {
  gallery: GalleryImage[];
}

export interface Specialization {
  id: number;
  name: string;
  icon: string;
  order: number;
}

export interface Achievement {
  id: number;
  text: string;
  order: number;
}

export interface Certificate {
  id: number;
  title: string;
  image_url: string | null;
  order: number;
}

export interface Trainer {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
  experience_years: number | null;
  category_id: number;
  category_name: string;
  is_coach: boolean;
  description: string;
  specializations: Specialization[];
  achievements: Achievement[];
  order: number;
}

export interface TrainerDetail extends Trainer {
  certificates: Certificate[];
}

export interface SessionCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface SessionCoach {
  id: number;
  name: string;
  photo_url: string | null;
}

export interface SessionZone {
  id: number;
  name: string;
}

export interface ScheduleSession {
  slot_id: number;
  date: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  section_id: number;
  section_name: string;
  section_description: string;
  section_image_url: string | null;
  category: SessionCategory;
  coach: SessionCoach;
  zone: SessionZone;
  is_cancelled: boolean;
  cancel_reason: string;
}

export interface CardFeature {
  id: number;
  text: string;
  order: number;
}

export interface ClubCard {
  id: number;
  card_type: number;
  card_type_label: string;
  name: string;
  description: string;
  price: string;
  old_price: string | null;
  is_popular: boolean;
  image_url: string | null;
  order: number;
  features: CardFeature[];
}

export interface NewsListItem {
  id: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  published_at: string;
}

export interface NewsDetail extends NewsListItem {
  content: string;
}

export interface PaginatedNews {
  total: number;
  page: number;
  page_size: number;
  results: NewsListItem[];
}

export interface LeadCreate {
  name: string;
  phone: string;
  comment?: string;
  related_trainer_id?: number;
  related_card_id?: number;
  related_section_id?: number;
  source_page?: string;
}

export type Lang = "ru" | "en" | "kg";
