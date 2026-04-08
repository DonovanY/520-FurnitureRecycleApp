import React from "react";
import { useParams } from "react-router-dom";

function ItemDetail() {
  const { id } = useParams();

  return (
    <div className="item-detail">
      <h1>Item {id}</h1>
      <p>Item details would go here</p>
    </div>
  );
}

export default ItemDetail;
