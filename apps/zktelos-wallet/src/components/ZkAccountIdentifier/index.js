
import React from 'react';
import { createAvatar } from '@dicebear/core';
import * as glass from '@dicebear/glass';
const { uniqueNamesGenerator, names, } = require('unique-names-generator');

export const ZkAvatar = ({ seed, size, ...props }) => {
  const avatar = createAvatar(glass, { seed, radius: 50 });
  return <img {...props} style={{ height: size }} src={avatar.toDataUri()} alt="" />;
};

export const ZkName = ({ seed, ...props }) =>
  <span {...props}>zk{uniqueNamesGenerator({ dictionaries: [names], seed })}</span>;
