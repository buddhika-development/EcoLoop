from src.configs.supabase import suapabase_connection

supabase = suapabase_connection()

def get_all_posts():
    if not supabase:
        return {"error": "Supabase connection not established."}, 500
    
    response = supabase.table('posts').select('*').execute()
    
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