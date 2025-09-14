# Migration Plan: Django-Only Architecture

## Current State
- Django backend with full functionality ✅
- Supabase for some frontend auth and data operations
- Dual data layer causing complexity

## Target State
- Pure Django backend
- Django REST Framework for API
- Django authentication system
- Simplified frontend using only Django API

## Migration Steps

### Phase 1: Remove Supabase Dependencies
1. **Remove Supabase packages**
   ```bash
   npm uninstall @supabase/supabase-js
   ```

2. **Update frontend authentication**
   - Replace Supabase auth with Django token auth
   - Update `useAuth.ts` to use Django API
   - Remove Supabase client imports

3. **Update data hooks**
   - Replace `useBookings.ts` Supabase calls with Django API calls
   - Replace `useLocations.ts` Supabase calls with Django API calls
   - Update all data fetching to use existing Django API

### Phase 2: Frontend Updates
1. **Authentication Flow**
   - Use Django's token authentication
   - Update login/logout to use Django endpoints
   - Remove Supabase auth components

2. **Data Management**
   - All CRUD operations through Django API
   - Use existing `apiClient` from `src/lib/api.ts`
   - Remove Supabase-specific code

### Phase 3: Cleanup
1. **Remove Supabase files**
   - Delete `src/integrations/supabase/`
   - Delete `supabase/` directory
   - Remove Supabase environment variables

2. **Update configuration**
   - Remove Supabase URLs from environment
   - Clean up unused dependencies

## Benefits After Migration

### Development Benefits
- ✅ Single backend to maintain
- ✅ Consistent data model
- ✅ No data synchronization issues
- ✅ Simpler debugging
- ✅ Better error handling

### Performance Benefits
- ✅ Faster API responses (no external calls)
- ✅ Reduced latency
- ✅ Better caching control
- ✅ Optimized database queries

### Cost Benefits
- ✅ No Supabase subscription
- ✅ Reduced infrastructure complexity
- ✅ Lower hosting costs

### Maintenance Benefits
- ✅ Single codebase to update
- ✅ Consistent authentication
- ✅ Unified logging and monitoring
- ✅ Easier testing

## Implementation Priority

### High Priority (Do First)
1. Update authentication to use Django only
2. Replace Supabase data calls with Django API
3. Remove Supabase dependencies

### Medium Priority
1. Clean up unused Supabase code
2. Update documentation
3. Optimize Django API endpoints

### Low Priority
1. Remove Supabase configuration
2. Clean up environment variables
3. Update deployment scripts

## Estimated Timeline
- **Phase 1**: 1-2 days
- **Phase 2**: 2-3 days  
- **Phase 3**: 1 day
- **Total**: 4-6 days

## Risk Mitigation
- Keep Supabase as backup during migration
- Test thoroughly before removing Supabase
- Have rollback plan ready
- Monitor performance after migration
