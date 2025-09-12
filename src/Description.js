
const CheckIcon = ({ className = "h-5 w-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = ({ className = "h-5 w-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

import { Link } from "react-router";

export default function Description() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-6 sm:py-8 flex items-center justify-between">
                        {/* Left Side: Back Button */}
                        {/* Title */}
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-white/10 p-3">
                                <svg
                                    className="h-8 w-8 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v6l4 2"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h1 className="text-white text-2xl sm:text-3xl font-semibold">
                                    📖 IGIDR Publication Upload
                                </h1>
                                <p className="text-indigo-100 mt-1 text-sm">
                                    Complete instructions to fill &amp; manage your submission
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-lg shadow hover:bg-gray-100 transition animate-bounce"
                        >
                            ⬅ Back
                        </Link>
                    </div>


                    {/* Content */}
                    <div className="p-6 sm:p-10 space-y-8">
                        {/* Intro */}
                        <div className="text-gray-700 prose max-w-none">
                            <p className="mb-0">
                                Use this guide to prepare your manuscript and metadata before submission, and to understand the post-submission
                                actions available (Save / Delete). Fields marked <span className="font-semibold">required</span> must be filled.
                            </p>
                        </div>

                        {/* Two-column layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Before Submission card */}
                            <div className="rounded-2xl border border-indigo-50 shadow-sm p-6 bg-white">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-indigo-700">📝 Before Submission</h2>
                                    <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-800 px-3 py-0.5 text-xs font-medium">
                                        Fill carefully
                                    </span>
                                </div>

                                <ol className="mt-4 space-y-4 text-gray-700">
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">
                                            1
                                        </span>
                                        <div>
                                            <div className="font-medium">Category <span className="text-gray-500 font-normal">(Required)</span></div>
                                            <div className="text-sm text-gray-600 mt-1">Choose one: <span className="font-medium">BR</span>, <span className="font-medium">WP</span>, <span className="font-medium">MN</span>, <span className="font-medium">PP</span>.</div>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">2</span>
                                        <div>
                                            <div className="font-medium">Author & Email <span className="text-gray-500 font-normal">(Required)</span></div>
                                            <div className="text-sm text-gray-600 mt-1">Enter the primary author&apos;s full name and a valid corresponding email (e.g., author@igidr.ac.in).</div>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">3</span>
                                        <div>
                                            <div className="font-medium">Title & Abstract <span className="text-gray-500 font-normal">(Required)</span></div>
                                            <div className="text-sm text-gray-600 mt-1">Provide the full title. Abstract: concise summary, objectives, methods, findings — max <span className="font-medium">1200 characters</span>.</div>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">4</span>
                                        <div>
                                            <div className="font-medium">JEL Code & Keywords</div>
                                            <div className="text-sm text-gray-600 mt-1">JEL (e.g., A1, B2) — up to <span className="font-medium">80 chars</span>. Keywords: comma-separated, up to <span className="font-medium">200 chars</span>.</div>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">5</span>
                                        <div>
                                            <div className="font-medium">Acknowledgement</div>
                                            <div className="text-sm text-gray-600 mt-1">Optional; mention funders or contributors. Max <span className="font-medium">500 chars</span>.</div>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">6</span>
                                        <div>
                                            <div className="font-medium">Upload PDF (Required)</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                A4 PDF only, &lt;10 MB. Page numbers must start at <span className="font-medium">1 (centered)</span>.
                                                Avoid spaces or special characters in the filename.
                                            </div>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">7</span>
                                        <div>
                                            <div className="font-medium">Submit</div>
                                            <div className="text-sm text-gray-600 mt-1">Click <span className="font-semibold">“Submit Publication”</span>. The button shows a loader while uploading.</div>
                                        </div>
                                    </li>
                                </ol>
                            </div>

                            {/* After Submission card */}
                            <div className="rounded-2xl border border-indigo-50 shadow-sm p-6 bg-white">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-purple-700">✅ After Submission</h2>
                                    <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-3 py-0.5 text-xs font-medium">
                                        Follow-up actions
                                    </span>
                                </div>

                                <div className="mt-4 space-y-4">
                                    {/* Success */}
                                    <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="text-green-700 bg-green-100 rounded-full p-2">
                                                <CheckIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-green-800">Case 1: Successful Submission</div>
                                                <div className="text-sm text-gray-700 mt-1">
                                                    You will receive a success toast with an <span className="font-bold">assigned publication number</span> and <span className="font-bold">a button to view your uploaded file. In this file, you can see that the cover page and abstract have been generated based on your input.</span>
                                                </div>

                                                <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-2">
                                                    <li>
                                                        <b>Save Record:</b> Finalizes & locks the record. Use this after verifying the uploaded file. Confirmation: <span className="text-green-700 font-medium">“👍 Record Finalized!”</span>
                                                    </li>
                                                    <li>
                                                        <b>Delete Record:</b> Removes the submission if details/file are incorrect. Confirmation: <span className="text-red-700 font-medium">“🗑️ Record Deleted!”</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Failure */}
                                    <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="text-red-700 bg-red-100 rounded-full p-2">
                                                <XIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-red-800">Case 2: Failed Submission</div>
                                                <div className="text-sm text-gray-700 mt-1">
                                                    An error will be shown (e.g., file too large, missing required fields). No record is created until submission succeeds.
                                                </div>

                                                <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-2">
                                                    <li>Fix the error (adjust file, complete required fields) and try again.</li>
                                                    <li>Verify file size, format, and naming rules before re-uploading.</li>
                                                    <li>Contact : hdesk@igidr.ac.in</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary and notes */}
                        <div className="rounded-2xl border border-indigo-50 p-6 bg-gradient-to-t from-white to-indigo-50">
                            <h3 className="text-lg font-semibold text-indigo-700">🔑 Summary</h3>
                            <div className="mt-3 text-gray-700">
                                <p className="mb-2">
                                    <strong>Before submission:</strong> Fill all required fields accurately and upload a valid A4 PDF (≤10 MB). Check character limits for fields.
                                </p>
                                <p className="mb-0">
                                    <strong>After submission:</strong> On success, review the file via the provided link, then click <span className="font-semibold text-green-700">Save Record</span> to finalize — or use <span className="font-semibold text-red-700">Delete Record</span> to remove an incorrect submission. If submission fails, correct errors and resubmit.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
