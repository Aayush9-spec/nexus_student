/**
 * Next.js configuration file.
 * Sets the Turbopack root to the project directory to silence the warning about multiple lockfiles.
 */
module.exports = {
    turbopack: {
        root: "/Users/aayushkumarsingh/Documents/nexus_student"
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            }
        ],
    }
};
