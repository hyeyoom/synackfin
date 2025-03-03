import { Database } from "@/lib/utils/supabase/supabase";

export type ArticleWithProfile = Database['public']['Tables']['user_articles']['Row'] & {
    user_profiles: {
        name: string | null;
    } | null;
}; 