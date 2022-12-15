import { MantineProvider, ColorSchemeProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';

import React from 'react';
import { RouterProvider } from 'react-router-dom';

import router from './routes';
import { socket, SocketContext } from './socket';

import useColorScheme from '@/hooks/useColorScheme';

const App = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }}>
        <NotificationsProvider position="top-right">
          <SocketContext.Provider value={socket}>
            <RouterProvider router={router} />
          </SocketContext.Provider>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default App;
