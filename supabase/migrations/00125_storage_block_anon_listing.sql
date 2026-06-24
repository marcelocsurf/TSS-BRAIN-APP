-- SECURITY: stop anonymous ENUMERATION of storage buckets.
--
-- The `avatars` and `tss-library` buckets had a SELECT policy on storage.objects
-- granted to the `public` role, which let anon call list() and enumerate every
-- file — including avatars/students/<uuid>.jpg (student photos + ids, possibly
-- minors). Restricting these SELECT policies to `authenticated` blocks anonymous
-- listing. Direct public-URL fetches (/object/public/...) still work because the
-- buckets remain public; only the enumeration/list endpoint is now gated.

alter policy "Public avatar access"    on storage.objects to authenticated;
alter policy "tss-library public read" on storage.objects to authenticated;
