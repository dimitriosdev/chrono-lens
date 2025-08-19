// This file handles static generation for dynamic routes
export async function generateStaticParams() {
  // Return empty array for dynamic routes that will be handled client-side
  return [];
}

export const dynamic = "force-static";
export const dynamicParams = true;
