from src.configs.supabase import suapabase_connection

supabase = suapabase_connection()

def get_all_posts():
    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    response = supabase.table('posts').select('*').order('created_at', desc=True).execute()
    
    return response.data if response.data else None

def access_single_post(post_id):
    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    response = supabase.table('posts').select('*').eq('id', post_id).execute()
    
    return response.data[0] if response.data else None


def post_search(query : str) :

    response = supabase.table("posts").select("*").ilike("post_title", query).execute()

    print(response)

    return None


def access_single_post_by_id(post_id):
    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    try:
        response = supabase.table('posts').select('*').eq('post_id', post_id).execute()
        return response.data[0]
    except Exception as e:
        print(f"Error accessing post with ID {post_id}: {e}")
        return None
    

def create_new_post(post_title, post_content, image_path=None, post_author=None):

    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    try:
        response = supabase.table('posts').insert({
            'post_title': post_title,
            'post_content': post_content,
            'post_image_url': image_path,
            'post_author': post_author
        }).execute()

        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error creating post: {e}")
        return None

    
def like_post(post_id, user_id):
    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    single_post = access_single_post_by_id(post_id)
    
    if not single_post:
        return {"message": "Post not found."}, 404
    
    post_like_count = single_post.get('like_count') or 0
    new_like_count = post_like_count + 1

    try:
        post_response = supabase.table('posts').update({
            'like_count': new_like_count
        }).eq('post_id', post_id).execute()

        post_like_response = supabase.table('post_likes').insert({
            'post_id': post_id,
            'user_id': user_id
        }).execute()
        
    
    except Exception as e:
        print(f"Error liking post: {e}")
        return {"message": "Failed to like post."}, 500

    return {
        "message": "Post liked successfully."
    }, 200


def like_post(post_id, user_id):
    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    single_post = access_single_post_by_id(post_id)
    
    if not single_post:
        return {"message": "Post not found."}, 404
    
    post_like_count = single_post.get('like_count') or 0
    new_like_count = post_like_count + 1

    try:
        post_response = supabase.table('posts').update({
            'like_count': new_like_count
        }).eq('post_id', post_id).execute()

        post_like_response = supabase.table('post_likes').insert({
            'post_id': post_id,
            'user_id': user_id
        }).execute()
        
    
    except Exception as e:
        print(f"Error liking post: {e}")
        return {"message": "Failed to like post."}, 500

    return {
        "message": "Post liked successfully."
    }, 200


def like_post(post_id, user_id):
    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    single_post = access_single_post_by_id(post_id)
    
    if not single_post:
        return {"message": "Post not found."}, 404
    
    post_like_count = single_post.get('like_count') or 0
    new_like_count = post_like_count + 1

    try:
        post_response = supabase.table('posts').update({
            'like_count': new_like_count
        }).eq('post_id', post_id).execute()

        post_like_response = supabase.table('post_likes').insert({
            'post_id': post_id,
            'user_id': user_id
        }).execute()
        
    
    except Exception as e:
        print(f"Error liking post: {e}")
        return {"message": "Failed to like post."}, 500

    return {
        "message": "Post liked successfully."
    }, 200



def unlike_post(post_id, user_id):
    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    single_post = access_single_post_by_id(post_id)
    
    if not single_post:
        return {"message": "Post not found."}, 404
    
    post_like_count = single_post.get('like_count') or 0
    new_like_count = post_like_count
    
    if post_like_count > 0 :
        new_like_count = post_like_count - 1

    try:
        post_response = supabase.table('posts').update({
            'like_count': new_like_count
        }).eq('post_id', post_id).execute()

        post_like_response = supabase.table('post_likes').delete().eq('post_id', post_id).eq('user_id', user_id).execute()
        
    
    except Exception as e:
        print(f"Error liking post: {e}")
        return {"message": "Failed to like post."}, 500

    return {
        "message": "Post unliked successfully."
    }, 200



def check_already_liked(post_id, user_id):

    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    try:
        response = supabase.table('post_likes').select('*').eq('post_id', post_id).eq('user_id', user_id).execute()
        return True if response.data and len(response.data) > 0 else False
    except Exception as e:
        print(f"Error checking like status: {e}")
        return False


def fetch_post_by_user_id(user_id) :

    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    try:
        response = supabase.table('posts').select('*').eq('post_author', user_id).execute()
        return response.data if response.data else None
    except Exception as e:
        print(f"Error fetching posts for user {user_id}: {e}")
        return None