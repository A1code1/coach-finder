# Adding 30 Coach Profiles to the Database

## Step 1: Run the SQL Insert Script

1. Go to your Supabase project → **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `seed-coaches.sql` from your project folder
4. Paste it into the SQL editor
5. Click **Run**

✅ You should see "30 rows inserted successfully"

## Step 2: Handle Coach Photos

The coaches are currently using **placeholder images** from `i.pravatar.cc`. You have 3 options:

### Option A: Keep Placeholder Images (Easiest)
The current setup uses realistic avatar placeholders. They work fine for testing!
- No additional action needed
- Images are hosted externally, so no storage cost

### Option B: Upload Real Images to Supabase Storage (Recommended)

If you want to use your own images:

1. **Create a Supabase Storage bucket** (if not already done):
   - Go to Supabase → **Storage** → **Create a new bucket**
   - Name: `coach-photos`
   - Make it **Public**

2. **Prepare your images**:
   - Get 30 coach photos (JPG/PNG format, <2MB each)
   - You can use free stock photos from:
     - [Unsplash](https://unsplash.com) - search "coach sports"
     - [Pexels](https://pexels.com)
     - [Pixabay](https://pixabay.com)

3. **Upload images to Supabase**:
   - Go to Storage → `coach-photos` → Click **Upload**
   - Upload all 30 images
   - They'll get public URLs like: `https://your-project.supabase.co/storage/v1/object/public/coach-photos/coach1.jpg`

4. **Update the database** with real image URLs:
   ```sql
   UPDATE coaches SET photo_url = 'https://your-project.supabase.co/storage/v1/object/public/coach-photos/coach-name.jpg' 
   WHERE name = 'Coach Name';
   ```

### Option C: Use Public URLs from Image Services

Replace placeholder URLs with real coach images:

```sql
UPDATE coaches SET photo_url = 'https://unsplash.com/photos/...jpg' WHERE name = 'Marco van der Berg';
```

## Step 3: Verify the Data

Go to http://localhost:3000/search and:
1. Select **Amsterdam** (or any city from the list)
2. Click **Search Coaches**
3. You should see coach cards appearing!

Click on a coach card to see full details including the photo.

## Step 4: Test Admin Approval

1. Go to `/admin/login`
2. Log in with your admin account (`yoavhart11@gmail.com`)
3. Go to **Approved** tab
4. Click **More Details** on any coach to see the expanded card with photo

## If Images Don't Load

If images show as broken:
- The placeholder URLs might be blocked by your browser
- Try uploading real images to Supabase Storage (Option B)
- Or use HTTPS URLs from image services

## Updating Individual Coach Details

To edit a specific coach:

```sql
UPDATE coaches SET 
  bio = 'New bio text',
  hourly_rate = 50.00,
  photo_url = 'new-image-url'
WHERE name = 'Marco van der Berg';
```

## Removing Test Data

If you want to delete all coaches and start fresh:

```sql
DELETE FROM coaches;
```

Then run the insert script again.

---

**That's it!** Your database now has 30 realistic coaches ready to search and manage.
