import os
from dotenv import load_dotenv
import boto3

load_dotenv()

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name=os.getenv("AWS_REGION")
)

def store_post_image(file):
    """Store an image file in the configured S3 bucket and return its URL."""

    try:
        bucket_name = os.getenv("AWS_POST_IMAGE_BUCKET")
        if not bucket_name:
            raise ValueError("S3 bucket name is not configured.")
        
        # Generate a unique filename
        current_time = int(os.times()[4] * 1000)
        uuid = os.urandom(8).hex()
        filename = f"{uuid}_{file.filename}"
        s3_key = f"{filename}"

        # Upload the file to S3
        s3_client.upload_fileobj(file, bucket_name, s3_key)

        # Construct the file URL
        file_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{s3_key}"
        return file_url
    except Exception as e:
        print(f"Error uploading file to S3: {e}")
        return None