'use server';

import { createSupabaseClientForServer } from '@/lib/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkUserProfile() {
  try {
    const supabase = await createSupabaseClientForServer();
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: '로그인이 필요합니다.', hasProfile: false };
    }
    
    // 사용자 프로필 확인 - 필요한 필드만 선택
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('name, bio, created_at, updated_at')
      .eq('author_id', user.id)
      .single();
    
    if (error || !profile) {
      return { hasProfile: false };
    }
    
    // 이미 author_id를 제외한 필드만 선택했으므로 안전하게 반환
    return { 
      hasProfile: true, 
      profile 
    };
  } catch (error) {
    console.error('프로필 확인 오류:', error);
    return { error: '서버 오류가 발생했습니다.', hasProfile: false };
  }
}

export async function createUserProfile(params: { name: string; bio?: string }) {
  try {
    const supabase = await createSupabaseClientForServer();
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: '로그인이 필요합니다.' };
    }
    
    // 프로필 생성
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        author_id: user.id,
        name: params.name,
        bio: params.bio || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('프로필 생성 오류:', error);
      return { error: error.message };
    }
    
    // 캐시 무효화
    revalidatePath('/profile');
    
    return { success: true };
  } catch (error) {
    console.error('서버 액션 오류:', error);
    return { error: '서버 오류가 발생했습니다.' };
  }
}

// 프로필 업데이트 함수 추가
export async function updateUserProfile(params: { name: string; bio?: string }) {
  try {
    const supabase = await createSupabaseClientForServer();
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: '로그인이 필요합니다.' };
    }
    
    // 프로필 업데이트
    const { error } = await supabase
      .from('user_profiles')
      .update({
        name: params.name,
        bio: params.bio || null,
        updated_at: new Date().toISOString()
      })
      .eq('author_id', user.id);
    
    if (error) {
      console.error('프로필 업데이트 오류:', error);
      return { error: error.message };
    }
    
    // 캐시 무효화
    revalidatePath('/profile');
    
    return { success: true };
  } catch (error) {
    console.error('서버 액션 오류:', error);
    return { error: '서버 오류가 발생했습니다.' };
  }
}