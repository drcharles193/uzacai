
export interface PostDraft {
  id: string;
  content: string;
  media_urls: string[];
  selected_accounts: string[];
  created_at: string;
  user_id: string;
}

export interface ScheduledPost {
  id: string;
  content: string;
  media_urls: string[];
  selected_accounts: string[];
  scheduled_for: string;
  created_at: string;
  status: 'scheduled';
  user_id: string;
}

export interface SocialAccount {
  platform: string;
  account_name: string;
  account_type?: string;
  platform_account_id?: string;
}
