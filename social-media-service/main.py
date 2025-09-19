import tweepy
import pymongo
import os
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client.get_default_database()
    social_mentions_collection = db["socialmentions"]
    print("Successfully connected to MongoDB.")
except pymongo.errors.ConfigurationError as e:
    print(f"MongoDB Configuration Error: {e}")
    exit()

# Connect to Twitter API v2
try:
    twitter_client = tweepy.Client(TWITTER_BEARER_TOKEN)
    print("Successfully connected to Twitter API.")
except Exception as e:
    print(f"Twitter API Connection Error: {e}")
    exit()

# --- Main Logic ---
def search_for_hazards():
    query = """
    ("oil spill" OR "illegal fishing" OR "red tide" OR "whale beaching" OR "polluted beach")
    (India OR Mumbai OR Chennai OR Vizag OR coast OR ocean) 
    -is:retweet lang:en
    """
    
    print(f"\nSearching for tweets with query: {query}")
    
    try:
        response = twitter_client.search_recent_tweets(
            query=query,
            max_results=10,
            tweet_fields=["created_at", "text", "author_id", "geo"]
        )
        
        if response.data:
            print(f"Found {len(response.data)} tweets.")
            for tweet in response.data:
                if not social_mentions_collection.find_one({"tweet_id": tweet.id}):
                    doc = {
                        "tweet_id": tweet.id,
                        "text": tweet.text,
                        "author_id": tweet.author_id,
                        "created_at": tweet.created_at,
                        "source": "twitter",
                        "processed": False
                    }
                    social_mentions_collection.insert_one(doc)
                    print(f"  -> Saved new tweet (ID: {tweet.id}) to database.")
                else:
                    print(f"  -> Tweet (ID: {tweet.id}) already exists, skipping.")
        else:
            print("No new tweets found matching the criteria.")

    except Exception as e:
        print(f"An error occurred during tweet search: {e}")

# --- Run the Script Continuously ---
if __name__ == "__main__":
    try:
        while True:
            search_for_hazards()
            print("\n--- Waiting for 60 seconds before next search ---")
            time.sleep(60) # Wait for 60 seconds
    except KeyboardInterrupt:
        print("\nScript stopped by user.")
    finally:
        client.close()
        print("MongoDB connection closed.")