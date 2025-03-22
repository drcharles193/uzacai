
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
  metadata?: {
    facebook_post_id?: string;
    twitter_post_id?: string;
  };
}

export interface SocialAccount {
  id?: string;
  platform: string;
  account_name: string;
  account_type?: string;
  platform_account_id?: string;
  access_token?: string;
  metadata?: {
    permissions?: string[];
    page_id?: string;
    user_id?: string;
    user_name?: string;
    connection_type?: string;
  };
}

export interface FacebookComment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
  replies?: FacebookReply[];
}

export interface FacebookReply {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
}
