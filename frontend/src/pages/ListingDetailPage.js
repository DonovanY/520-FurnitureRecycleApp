import useListingDetail from "../controllers/useListingDetail";
import ListingDetailView from "../views/ListingDetailView";

function ListingDetailPage() {
  const detailState = useListingDetail();

  return <ListingDetailView {...detailState} />;
}

export default ListingDetailPage;