# Firebase Setup Guide for AmiQuiz

## 1. Create and Configure Firebase Collections

### Collections Needed:
- **users** - For storing user profile information
- **quizzes** - For storing quiz data created by teachers
- **questions** - For storing questions related to quizzes
- **quizResults** - For storing student quiz results

## 2. Firebase Security Rules

Add these security rules to your Firebase Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quiz collection rules
    match /quizzes/{quizId} {
      // Anyone can read quizzes
      allow read: if request.auth != null;
      // Only teachers can create/update/delete quizzes
      allow create, update, delete: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "teacher";
    }
    
    // Questions collection rules
    match /questions/{questionId} {
      // Anyone can read questions
      allow read: if request.auth != null;
      // Only teachers can create/update/delete questions
      allow create, update, delete: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "teacher";
    }
    
    // Quiz results collection rules
    match /quizResults/{resultId} {
      // Allow users to read their own results or teachers to read all results
      allow read: if request.auth != null && (
        resource.data.studentId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "teacher"
      );
      // Allow users to create their own results
      allow create: if request.auth != null && request.resource.data.studentId == request.auth.uid;
    }
  }
}
```

## 3. Steps to Set Up Firebase (For AmiQuiz Admin)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create or Select Your Project**
3. **Set Up Firestore Database**:
   - Go to Firestore Database in the left menu
   - Click "Create Database"
   - Start in production mode
   - Choose a location close to your users

4. **Add Security Rules**:
   - Navigate to the "Rules" tab in Firestore
   - Replace the default rules with the ones provided above
   - Click "Publish"

5. **Configure Authentication**:
   - Go to Authentication in the left menu
   - Set up Email/Password and Google Sign-in methods
   - Add your app's domain (including your Replit domain) to the authorized domains list

6. **Create Web App Configuration**:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click the web icon (</>) 
   - Register your app
   - Copy the configuration values for:
     - `apiKey`
     - `projectId`
     - `appId`
   - Add these as environment variables in your Replit project

## 4. Environment Variables to Add in Replit

Add these environment variables to your Replit:

- `VITE_FIREBASE_API_KEY` - The API key from your Firebase project
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID

## 5. Testing Your Setup

After configuring everything:
1. Try creating a new user account
2. Verify that user data is stored in the "users" collection
3. Try creating a quiz (as a teacher)
4. Try taking a quiz (as a student)

If you encounter any issues, double-check:
- Firebase security rules
- Authentication settings
- Environment variables