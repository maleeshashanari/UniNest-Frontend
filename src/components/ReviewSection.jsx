import { useEffect, useState } from "react";
import { Star, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={16}
                    className={
                        star <= Number(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                    }
                />
            ))}
        </div>
    );
}

export default function ReviewSection({ accommodationId }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [university, setUniversity] = useState("");
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Load reviews when filters or accommodation change
    useEffect(() => {
        let isMounted = true;

        const loadReviews = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    `/feedback/accommodation/${accommodationId}`,
                    {
                        params: {
                            university: university.trim() || undefined,
                            sort
                        }
                    }
                );

                if (isMounted) {
                    setReviews(response.data.feedbacks || []);
                }
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        error.response?.data?.message ||
                        "Unable to load reviews."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadReviews();

        return () => {
            isMounted = false;
        };
    }, [accommodationId, university, sort]);

    // Submit a review
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            toast.error("Please write your review.");
            return;
        }

        try {
            setSubmitting(true);

            await api.post("/feedback/add", {
                accommodation: accommodationId,
                rating,
                comment: comment.trim()
            });

            toast.success("Your review was submitted!");
            setComment("");
            setRating(5);

            // Reload the page's review list after submission
            const response = await api.get(
                `/feedback/accommodation/${accommodationId}`,
                {
                    params: {
                        university: university.trim() || undefined,
                        sort
                    }
                }
            );

            setReviews(response.data.feedbacks || []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to submit or reload your review."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Get reviewer name
    const getReviewerName = (review) => {
        const reviewer =
            review.student ||
            review.user ||
            review.createdBy;

        if (typeof reviewer === "object" && reviewer !== null) {
            return [
                reviewer.firstName,
                reviewer.lastName
            ].filter(Boolean).join(" ") || "Student";
        }

        return "Student";
    };

    return (
        <section className="space-y-7">

            {/* Review Form */}
            <div className="rounded-2xl border border-border bg-white p-6">
                <h2 className="mb-5 text-xl font-semibold text-ink">
                    Write a Review
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-ink">
                            Your Rating
                        </label>

                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition hover:scale-110"
                                >
                                    <Star
                                        size={28}
                                        className={
                                            star <= rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="reviewComment"
                            className="mb-2 block text-sm font-medium text-ink"
                        >
                            Your Review
                        </label>

                        <textarea
                            id="reviewComment"
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Send size={17} />
                        {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            </div>

            {/* Review Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Filter by university"
                    className="flex-1 rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                />

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-5">
                <h2 className="text-xl font-semibold text-ink">
                    Student Reviews
                </h2>

                {loading ? (
                    <p className="text-muted">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <div className="rounded-xl border border-border p-8 text-center">
                        <MessageSquare
                            size={32}
                            className="mx-auto mb-3 text-muted"
                        />
                        <p className="text-muted">
                            No reviews yet. Be the first to review!
                        </p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review._id}
                            className="rounded-2xl border border-border bg-white p-5"
                        >
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-ink">
                                        {getReviewerName(review)}
                                    </h3>

                                    <p className="text-sm text-muted">
                                        {review.university ||
                                            review.student?.university ||
                                            review.user?.university ||
                                            "University not specified"}
                                    </p>
                                </div>

                                <StarRating rating={review.rating} />
                            </div>

                            <p className="whitespace-pre-wrap text-ink">
                                {review.comment}
                            </p>

                            {review.adminReply && (
                                <div className="mt-4 rounded-xl bg-background p-4">
                                    <p className="mb-1 text-sm font-semibold text-primary-700">
                                        Admin Reply
                                    </p>
                                    <p className="text-sm text-ink">
                                        {review.adminReply}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}