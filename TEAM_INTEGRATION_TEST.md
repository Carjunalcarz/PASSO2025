# Team Integration Test Guide

## What Was Changed

The PersonForm now uses **real team data** from the `teams` collection instead of hardcoded values.

### Changes Made:
1. ✅ Imported `useGetActiveTeams` hook from `../../hooks/useTeams`
2. ✅ Added teams data fetching: `const { data: teams = [], isLoading: isLoadingTeams } = useGetActiveTeams()`
3. ✅ Replaced hardcoded team options with dynamic data from database
4. ✅ Added loading state and team count display
5. ✅ Added console logging for debugging

## How to Test

### Step 1: Check Browser Console
1. Open the PersonForm in edit mode (edit any existing person)
2. Open browser DevTools (F12)
3. Check the Console tab for these logs:
   ```
   Teams loaded: [array of team objects]
   Teams loading: false
   Teams count: X
   ```

### Step 2: Verify UI Display
1. In the "Team Assignment" section, you should see:
   - `(X teams available)` - where X is the actual count from database
   - If loading: `(Loading teams...)`
   - If no teams: Button should be disabled

### Step 3: Test Team Selection
1. Click the "+ Add to Team" button
2. The dropdown should show:
   - "Choose a team..." (default option)
   - All active teams from your database (not hardcoded values)
   - If no teams exist: "No active teams available" message

### Step 4: Verify Team Assignment
1. Select a team from the dropdown
2. Click "Add to Team"
3. Success message should show the actual team name from database

## Expected Behavior

### If Teams Exist in Database:
- ✅ Button is enabled
- ✅ Shows team count: "(3 teams available)"
- ✅ Dropdown populated with real team names
- ✅ Success message shows selected team name

### If No Teams in Database:
- ✅ Button is disabled
- ✅ Shows: "(0 teams available)"
- ✅ Dropdown shows "No active teams available"

### While Loading:
- ✅ Shows: "(Loading teams...)"
- ✅ Button is disabled

## Troubleshooting

### If teams don't load:
1. Check `.env` file has: `VITE_APPWRITE_TEAMS_COLLECTION_ID=teams`
2. Verify teams collection exists in Appwrite database
3. Check browser console for errors
4. Verify at least one team has `status: 'active'`

### If dropdown is empty:
1. Go to `/users/team` page
2. Add some teams with status "active"
3. Return to PersonForm and refresh

## Database Requirements

The teams collection should have:
- `$id` - Document ID
- `team_name` - Team name (required)
- `description` - Team description (optional)
- `status` - Must be "active" to appear in dropdown
- `$createdAt` - Creation timestamp
- `$updatedAt` - Update timestamp

## Next Steps

After confirming teams load correctly, you may want to:
1. Remove the debug console.log statements
2. Implement actual team assignment (save to database)
3. Display assigned teams in the UI
4. Add ability to remove team assignments
