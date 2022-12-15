import {
  Button, Group, SimpleGrid, TextInput, Title, Text,
} from '@mantine/core';
import {
  useContext,
  useEffect, useState,
} from 'react';

import { useSearchParams } from 'react-router-dom';

import { PresentationWithUserCreated, Option } from '@/api/presentation';

import { SocketContext } from '@/socket';
import {
  ClientToServerEventType,
  ServerToClientEventType,
} from '@/socket/types';
import { SlideType } from '@/utils/constants';

export interface ShowPageProps {
  roomId: string;
}

function InputCodePage({ setRoomId }: { setRoomId: (_: string) => void }) {
  const [input, setInput] = useState('');

  return (
    <Group position="center">
      <TextInput placeholder="Enter room id here" value={input} onChange={(e) => setInput(e.currentTarget.value)} />
      <Button onClick={() => setRoomId(input)}>Join</Button>
    </Group>
  );
}

function ShowPage({ roomId }: ShowPageProps) {
  const [presentation, setPresentation] = useState<PresentationWithUserCreated>();
  const [voteValue, setVoteValue] = useState<Option>();

  const multiChoiceSlide = (presentation?.slides || []).find((s) => s.slideType === SlideType.MultipleChoice);
  const options = multiChoiceSlide?.options || [];

  const socket = useContext(SocketContext);

  const sendVote = (option: Option) => {
    setVoteValue(option);
    socket.emit(ClientToServerEventType.memberVote, {
      slideId: multiChoiceSlide?._id || '',
      optionIndex: option.index || -1,
    });
  };

  socket.on(ServerToClientEventType.waitJoinRoom, (data) => {
    setPresentation(data.data);
  });

  useEffect(() => {
    socket.emit(ClientToServerEventType.joinRoom, { roomId });
  }, [roomId, socket]);

  return (
    <div>
      <Title order={3} sx={{ textAlign: 'center' }}>{multiChoiceSlide?.title}</Title>
      {
        voteValue ? (
          <Text sx={{ textAlign: 'center' }}>
            You voted for
            {' '}
            {voteValue.value}
          </Text>
        ) : (
          <SimpleGrid
            cols={4}
            spacing="lg"
            breakpoints={[
              {
                maxWidth: 980, cols: 3, spacing: 'md',
              },
              {
                maxWidth: 755, cols: 2, spacing: 'sm',
              },
              {
                maxWidth: 600, cols: 1, spacing: 'sm',
              },
            ]}
          >
            {
              options.map((o) => (
                <Button
                  key={`${o.index}__${o.value}`}
                  onClick={() => sendVote(o)}
                >
                  {o.value}
                </Button>
              ))
            }
          </SimpleGrid>
        )
      }
    </div>
  );
}

export default function GuestPresentation() {
  const [roomId, setRoomId] = useState('');
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      setRoomId(id);
    }
  }, [id]);

  return (
    roomId ? (
      <ShowPage roomId={roomId} />
    ) : (
      <InputCodePage setRoomId={setRoomId} />
    )
  );
}
