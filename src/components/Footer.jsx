import React from 'react';

import { Link as RouterLink } from 'react-router-dom';
import { Link, Box } from '@material-ui/core';
import { Link as ALink } from '@aragon/ui';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  element: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(3),
  },
  link: {
    color: 'black',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    }
  }
}));

function Footer() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.element}>
        <ALink href="https://github.com/pakokrew/mooni/tree/master" external className={classes.link}>v0.3</ALink>
      </Box>
      <Box className={classes.element}>
        <Link to="/terms" component={RouterLink} className={classes.link}>
          Terms
        </Link>
      </Box>
      <Box className={classes.element}>
        <Link to="/about" component={RouterLink} className={classes.link}>
          About
        </Link>
      </Box>
    </Box>
  );
}

export default Footer;
