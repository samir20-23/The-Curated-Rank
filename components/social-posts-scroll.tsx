"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFirebaseSocialPosts } from "@/hooks/use-firebase-social-posts"
import SocialPostDialog from "@/components/admin/social-post-dialog"
import type { SocialPost } from "@/lib/types"

export default function SocialPostsScroll() {
  const { isAdmin } = useAuth()
  const { posts, loading, deletePost } = useFirebaseSocialPosts()
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null)

  const handleAddPost = () => {
    setEditingPost(null)
    setIsPostDialogOpen(true)
  }

  const handleEditPost = (post: SocialPost) => {
    setEditingPost(post)
    setIsPostDialogOpen(true)
  }

  const handleDeletePost = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(id)
    }
  }

  if (loading) return null

  return (
    <div style={{ position: "relative", top: "111px" }}>
      <div className="flex items-center justify-center gap-2 mb-4">
        {isAdmin && (
          <button
            onClick={handleAddPost}
            className="px-3 py-1 glass text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition"
            title="Add Social Post"
          >
            + Add Post
          </button>
        )}
      </div>
      {posts.length === 0 && !isAdmin ? null : (
        <div className="relative overflow-hidden  z-0 hover:z-10">
          <div
            className="flex gap-4 animate-scroll-right hover:z-10"
            style={{ width: "max-content" }}
          >
            {posts.length > 0 ? (
              [...posts, ...posts.slice(0, Math.max(0, posts.length - 1))].map((post, index) => (
                <div key={`${post.id}-${index}`} className="relative group flex-shrink-0">

                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-64 h-48 glass-strong rounded-lg overflow-hidden cursor-pointer opacity-70 hover:opacity-100 hover:z-10 transition-all duration-100 ease-in-out hover:scale-90 block"
                  >
                    {/* <span className="relative flex size-3" style={{ position: "absolute" , top:"0px" , left:"0px", zIndex:"12" }}>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
                    </span> */}

                    {post.imageUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={post.imageUrl}
                          alt={post.title || "Social post"}
                          className="  object-cover  "
                        />
                        {(post.title || post.description) && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                            {post.title && (
                              <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                                {post.title}
                              </h3>
                            )}
                            {post.description && (
                              <p className="text-white/90 text-xs line-clamp-2">
                                {post.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center p-4">
                        <div className="text-center">
                          {post.title && (
                            <h3 className="text-foreground font-bold text-sm mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                          )}
                          {post.description && (
                            <p className="text-foreground/70 text-xs line-clamp-3">
                              {post.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </a>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleEditPost(post)
                        }}
                        className="group relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-red-500/90 backdrop-blur-md shadow-md transition-all duration-300 hover:w-14 hover:rounded-md active:translate-x-px active:translate-y-px"
                      >
                        <svg viewBox="0 0 1024 1024" className="h-3.5 w-3.5 fill-white">
                          <path d="M603.733333 181.333333L386.133333 401.066667c-6.4 6.4-10.666667 14.933333-12.8 25.6l-51.2 211.2c-8.533333 38.4 23.466667 74.666667 61.866667 64l200.533333-53.333334c8.533333-2.133333 17.066667-6.4 23.466667-14.933333l234.666667-236.8V853.333333c0 40.533333-32 72.533333-70.4 74.666667H170.666667c-40.533333 0-74.666667-34.133333-74.666667-74.666667V256c0-40.533333 34.133333-74.666667 74.666667-74.666667h433.066666z" />
                          <path d="M738.133333 147.2L435.2 448c-4.266667 4.266667-6.4 8.533333-8.533333 14.933333l-32 125.866667c-6.4 23.466667 14.933333 44.8 38.4 38.4l128-29.866667c6.4-2.133333 10.666667-4.266667 14.933333-8.533333l300.8-302.933333c38.4-38.4 38.4-102.4 0-140.8s-100.266667-38.4-138.666667 2.133333z" />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleDeletePost(post.id)
                        }}
                        className="group relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full glass text-red-400 transition-all duration-300 hover:w-14 hover:bg-red-500/20 hover:rounded-md active:translate-x-px active:translate-y-px"
                      >
                        <svg viewBox="0 0 118 118" className="h-3.5 w-3.5" fill="none">
                          <path d="M95.875 27.0416L92.8281 76.3317C92.0493 88.9248 91.6604 95.2215 88.5039 99.7488C86.9429 101.987 84.9339 103.876 82.6034 105.295C77.8903 108.167 71.5817 108.167 58.9641 108.167C46.3303 108.167 40.0133 108.167 35.297 105.29C32.9653 103.868 30.9553 101.976 29.3952 99.7336C26.2397 95.1994 25.859 88.8938 25.0977 76.283L22.125 27.0416" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                          <path d="M14.75 27.0417H103.25M78.9405 27.0417L75.5844 20.1177C73.3547 15.5183 72.2396 13.2186 70.3167 11.7844C69.8904 11.4662 69.4386 11.1832 68.9661 10.9381C66.8367 9.83337 64.281 9.83337 59.1696 9.83337C53.9299 9.83337 51.3103 9.83337 49.1454 10.9845C48.6657 11.2396 48.2078 11.534 47.7767 11.8648C45.8314 13.3571 44.7448 15.741 42.5715 20.5087L39.5935 27.0417" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                          <path d="M46.7083 81.125V51.625" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                          <path d="M71.2917 81.125V51.625" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                        </svg>
                      </button>


                    </div>
                  )}
                </div>

              ))
            ) : (
              <div className="text-center text-foreground/60 py-8">
                No posts yet. {isAdmin && "Add your first post!"}
              </div>
            )}
          </div>
        </div>
      )}
      {posts.length === 0 && !isAdmin ? null : (
        <div className="relative overflow-hidden  z-0 hover:z-10">
          <div
            className="flex gap-4 animate-scroll-left hover:z-10"
            style={{ width: "max-content" }}
          >
            {posts.length > 0 ? (
              [...posts, ...posts.slice(0, Math.max(0, posts.length - 1))].map((post, index) => (
                <div key={`${post.id}-${index}`} className="relative group flex-shrink-0">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-64 h-48 glass-strong rounded-lg overflow-hidden cursor-pointer opacity-50 hover:opacity-100 hover:z-10 transition-all duration-100 ease-in-out hover:scale-90 block"
                  >
                    {post.imageUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={post.imageUrl}
                          alt={post.title || "Social post"}
                          className="  object-cover"
                        />
                        {(post.title || post.description) && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 ">
                            {post.title && (
                              <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                                {post.title}
                              </h3>
                            )}
                            {post.description && (
                              <p className="text-white/90 text-xs line-clamp-2">
                                {post.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center p-4">
                        <div className="text-center">
                          {post.title && (
                            <h3 className="text-foreground font-bold text-sm mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                          )}
                          {post.description && (
                            <p className="text-foreground/70 text-xs line-clamp-3">
                              {post.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </a>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">


                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleEditPost(post)
                        }}
                        className="group relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-red-500/90 backdrop-blur-md shadow-md transition-all duration-300 hover:w-14 hover:rounded-md active:translate-x-px active:translate-y-px"
                      >
                        <svg viewBox="0 0 1024 1024" className="h-3.5 w-3.5 fill-white">
                          <path d="M603.733333 181.333333L386.133333 401.066667c-6.4 6.4-10.666667 14.933333-12.8 25.6l-51.2 211.2c-8.533333 38.4 23.466667 74.666667 61.866667 64l200.533333-53.333334c8.533333-2.133333 17.066667-6.4 23.466667-14.933333l234.666667-236.8V853.333333c0 40.533333-32 72.533333-70.4 74.666667H170.666667c-40.533333 0-74.666667-34.133333-74.666667-74.666667V256c0-40.533333 34.133333-74.666667 74.666667-74.666667h433.066666z" />
                          <path d="M738.133333 147.2L435.2 448c-4.266667 4.266667-6.4 8.533333-8.533333 14.933333l-32 125.866667c-6.4 23.466667 14.933333 44.8 38.4 38.4l128-29.866667c6.4-2.133333 10.666667-4.266667 14.933333-8.533333l300.8-302.933333c38.4-38.4 38.4-102.4 0-140.8s-100.266667-38.4-138.666667 2.133333z" />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleDeletePost(post.id)
                        }}
                        className="group relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full glass text-red-400 transition-all duration-300 hover:w-14 hover:bg-red-500/20 hover:rounded-md active:translate-x-px active:translate-y-px"
                      >
                        <svg viewBox="0 0 118 118" className="h-3.5 w-3.5" fill="none">
                          <path d="M95.875 27.0416L92.8281 76.3317C92.0493 88.9248 91.6604 95.2215 88.5039 99.7488C86.9429 101.987 84.9339 103.876 82.6034 105.295C77.8903 108.167 71.5817 108.167 58.9641 108.167C46.3303 108.167 40.0133 108.167 35.297 105.29C32.9653 103.868 30.9553 101.976 29.3952 99.7336C26.2397 95.1994 25.859 88.8938 25.0977 76.283L22.125 27.0416" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                          <path d="M14.75 27.0417H103.25M78.9405 27.0417L75.5844 20.1177C73.3547 15.5183 72.2396 13.2186 70.3167 11.7844C69.8904 11.4662 69.4386 11.1832 68.9661 10.9381C66.8367 9.83337 64.281 9.83337 59.1696 9.83337C53.9299 9.83337 51.3103 9.83337 49.1454 10.9845C48.6657 11.2396 48.2078 11.534 47.7767 11.8648C45.8314 13.3571 44.7448 15.741 42.5715 20.5087L39.5935 27.0417" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                          <path d="M46.7083 81.125V51.625" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                          <path d="M71.2917 81.125V51.625" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                        </svg>
                      </button>



                    </div>
                  )}
                </div>

              ))
            ) : (
              <div className="text-center text-foreground/60 py-8">
                No posts yet. {isAdmin && "Add your first post!"}
              </div>
            )}
          </div>
        </div>
      )}

      {isAdmin && (
        <SocialPostDialog
          isOpen={isPostDialogOpen}
          onClose={() => {
            setIsPostDialogOpen(false)
            setEditingPost(null)
          }}
          editingPost={editingPost}
        />
      )}
    </div>
  )
}

