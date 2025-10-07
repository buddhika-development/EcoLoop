# Educational Hub
Educational hub is the place share the knowledge about the ***How to beign a eco friendly person and save the world.***
That normally act as normal blog platform.
- system users can read the blogs
- system users can like the blog posts
- system users can share the blog posts


### Blog post data
Blog post schema

***Blog post table schema***
| field name | field data type | required | description
|:-----------|:----------------|:---------|:-----------
|blog_id | uuid | required (auto generated) | blog post unique identifier
|user_id | number (referenced from the users table) | required | who is the responsible person who is the post the content
|blog_title | string | required | what is the title / header of the blog post
|blog_content | string | required | what is the content of the article
|blog_cover_image | string | required | Image of the blog post
|created_date | date (automatically get) | required | what is the post created date


***Post tags table schema***
| field name | field data type | required | description
|:-----------|:----------------|:---------|:-----------
|tag_id | uuid (auto generated) | required | Unique identifier for blog post
|tag_body | string | required | what is the tag content is, ex: Healthy, Ewast
|created_date | date (automatically get) | required | What is the tag created date 


***Post tag connection***
| field name | field data type | required | description
|:-----------|:----------------|:---------|:-----------
|id | uuid (auto generated) | required | Unique identifier for blog tag connection
|post_id | number (reference from the blog post table) | required | What is the responsible blog post
|tag_id | number (reference from the post tag table) | required | what is the tag related to post
|created_date | date (automatically get) | required | what is the date post tag relation created


