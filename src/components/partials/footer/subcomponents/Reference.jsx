import PropTypes from "prop-types";
import { Link } from "@mui/material";
import "./reference.css";

export const Reference = ({ text, direction }) => {
  return (
    <Link href={direction} target="_blank" rel="noopener noreferrer" color="inherit" className="reference">
      {text}
    </Link>
  );
};

Reference.propTypes = {
  text: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
};
