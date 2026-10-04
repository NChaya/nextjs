import SearchResults from "./SearchResults";

export const metadata = {
  title: "Search | ShareWise",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return <SearchResults query={q} />;
}
