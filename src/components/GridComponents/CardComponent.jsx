import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import "./cardcomponent.css";

export const CardComponent = ({ url, img, title }) => {
  const isExternal = /^https?:\/\//i.test(url);

  const content = (
    <Box className="card-link">
      <img src={img} alt={title} className="img-card" />
    </Box>
  );

  if (isExternal) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="card-anchor">
        {content}
      </a>
    );
  }

  return (
    <Link to={url} className="card-anchor">
      {content}
    </Link>
  );
};

CardComponent.propTypes = {
  url: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
