import config from 'config';
import React from 'react';
import { io, Socket } from 'socket.io-client';

import { ClientToServerEvents, ServerToClientEvents } from './types';

import getJwtToken from '@/utils/getJwtToken';

const { jwtToken } = getJwtToken();

// eslint-disable-next-line max-len
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(config.backendUrl, { extraHeaders: { Authorization: `Bearer ${jwtToken}` } });

export const SocketContext = React.createContext(socket);
