export default function UserPage() {
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6 text-gray-800 dark:text-gray-100">
            <h1 className="text-2xl font-bold">User Page</h1>
            <p className="text-lg">This is the user page. You can add your profile here.</p>
            <a href="/user/profile">Profile page</a>
            <a href="/user/jobs">Applied Jobs</a>
        </div>
    );
}