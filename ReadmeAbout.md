# About This Site — App Pages and User/Admin Logic

## Purpose
This document describes the site structure and user flows (where users go and what they can do) without discussing implementation details or code. It covers the roles (visitor / authenticated user / admin), the pages they can access, and the typical journeys through the site.

## Roles
- Visitor: not signed in. Can browse public pages, view categories and items, and read social posts.
- Authenticated user: signed in. Can do everything a Visitor can, plus any user-level interactive features (save/like, create social posts if allowed, manage their own content if provided by UI).
- Admin: special privileges to create, edit, delete, and reorder categories and items; manage social links and posts; access admin dashboard and analytics.

## Top-level Navigation (what users see)
- Home: entry point showing featured items, hero, random scroll of items, and top categories.
- Categories: grid or list view of all categories.
- Category page (/category/[id]): list of items in the category, charts and summary for that category, and list or tiled view of items.
- Items list (/items or similar): general listing of all items across categories with search and pagination.
- Item page (/item/[id]): detailed view of a single item, images, description, related items, and sharing/social actions.
- Login: authentication page for users and admins.
- Admin area (/admin): protected area for admins only (dashboard, management pages).

## Public User Journeys
- Browse categories: from Home or Categories, select a category to view its items and charts.
- Search & filter: use site-level search or category filters to narrow items; use pagination to browse results.
- View item details: open an item page to see full information, images, links, and social/share buttons.
- Interact: depending on sign-in status, users may be able to like, save, or comment (UI-dependent). Anonymous users are prompted to log in for protected actions.
- Read social posts: social posts feed is visible; users can view and (if allowed) interact with posts.

## Admin Area & Flows
All admin pages are behind authentication/authorization and intended only for admin users.

- Admin Dashboard: high-level overview (analytics, charts, recent activity). Entry for admin tasks.

- Category Management:
  - List categories with controls to edit, delete, or open the category manager.
  - Create Category: admin can open a dialog to add a new category (title, image, metadata).
  - Edit Category: update category details.
  - Delete Category: remove a category after confirmation; may prompt for handling existing items.

- Item Management:
  - Category Items Manager / Item List Manager: shows items for a category and provides create/edit/delete controls.
  - Create Item: admin can add a new item, filling required fields and assigning it to a category.
  - Edit Item: admin can modify item details, update images, links, or metadata.
  - Delete Item: remove an item with a confirmation step.
  - Reorder items: drag-and-drop reordering where available to control display order.

- Social Links & Posts Management:
  - Create / Edit / Delete social posts and social links used on the site.
  - Manage visibility and ordering of social content.

- Dialogs & Helpers:
  - Create/Edit dialogs: modal forms for adding categories/items/social posts.
  - Delete confirmation: confirm destructive actions to prevent accidental deletes.

## Permissions / Capability Matrix (summary)
- Visitor: view Home, Categories, Category pages, Item pages, and Social posts; search and navigate.
- Authenticated user: same as Visitor plus site interactions gated by login (like/save, possibly create own content depending on site policy).
- Admin: full content management capabilities — create/edit/delete categories and items, reorder items, manage social links/posts, access admin dashboard and charts.

## Typical Admin Workflows
- Add a new category: Admin → Admin Dashboard or Category Management → Create Category dialog → Fill details → Save.
- Add items to category: Admin → Category Items Manager → Create Item → Assign category and save.
- Reorder items: Admin → Item List Manager → Drag-and-drop items → Save order.
- Remove content: Admin → select item/category → Delete → Confirm.

## Typical User Flows (examples)
- Discover content: Home → featured item or category → category page → item page → share or save.
- Explore broadly: Categories → category grid → open several item pages → follow related items.
- Use search: Items list or header search → enter term → filter results → paginate.

## UX & Navigation Notes (logical, not implementation)
- Protected admin routes: admin links are only exposed to users with admin access.
- Consistent breadcrumbs: show path so users can navigate back to category or home easily.
- Modal dialogs: creation and edit actions happen in dialogs so admins can quickly return to lists.
- Confirmation steps: destructive actions require explicit confirmation.

## Non-technical assumptions
- The site separates public browsing and admin content management clearly in the UI.
- Admin users have elevated controls visible only when authorized.
- Regular users are primarily readers/browsers with optional lightweight interactions.

## Quick Reference Map
- Public pages: Home, Categories, Category detail, Items list, Item detail, Login, Social posts.
- Admin pages: Admin dashboard, Category management, Category-items manager, Item management, Create/Edit dialogs, Social links/posts manager, Delete confirmations.

---
If you want, I can extend this into a visual sitemap or produce per-page copy/content guidelines for editors. Do you want a sitemap next?
