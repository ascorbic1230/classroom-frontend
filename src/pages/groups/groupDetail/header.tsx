import {
  Button, Group, Menu, Tooltip, Modal, TextInput, Breadcrumbs, Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSettings, IconUserPlus } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import groupApi, { Group as GroupType } from '@/api/group';
import * as notificationManager from '@/pages/common/notificationManager';
import { isAxiosError, ErrorResponse } from '@/utils/axiosErrorHandler';

export default function Header() {
  const [opened, setOpened] = useState(false);
  const [invitationModalOpened, setInvitationModalOpened] = useState(false);
  const [inviteViaEmailOpened, setInviteViaEmailOpened] = useState(false);
  const [groupData, setGroupData] = useState<GroupType>();
  const [invitationLink, setInvitationLink] = useState('');
  const [isLoading, setLoading] = useState(false);
  const { groupId } = useParams<string>();

  const form = useForm({
    initialValues: { email: '' },
    validate: { email: (value) => (/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) ? null : 'Invalid email') },
  });

  const breadcrumbsItems = [
    { title: 'Groups', to: '/groups' },
    { title: groupData?.name || '', to: '#' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: response } = await groupApi.getGroupById(groupId);

        setGroupData(response.data);
      } catch (error) {
        if (isAxiosError<ErrorResponse>(error)) {
          notificationManager.showFail('', error.response?.data.message);
        }
      }
    };

    fetchData();
  }, [groupId]);

  const handleOpenModal = () => {
    setOpened(true);
  };

  const handleCloseModal = () => {
    setOpened(false);
  };

  const handleOpenInvitationModal = async () => {
    try {
      const { data: response } = await groupApi.getInvitationLink(groupId);

      setInvitationLink(response.data);
    } catch (error) {
      if (isAxiosError<ErrorResponse>(error)) {
        notificationManager.showFail('', error.response?.data.message);
      }
    }

    setInvitationModalOpened(true);
  };

  const handleCloseInvitationModal = () => {
    setInvitationLink('');
    setInvitationModalOpened(false);
  };

  const handleCopyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    notificationManager.showSuccess('', 'Copy to clipboard');
  };

  const handleOpenInviteViaEmailModal = () => {
    form.reset();
    setInviteViaEmailOpened(true);
  };

  const handleCloseInviteViaEmailModal = () => {
    form.reset();
    setInviteViaEmailOpened(false);
  };

  const handleSubmitInviteViaEmailForm = async (values: { email: string }) => {
    try {
      setLoading(true);
      const { data: response } = await groupApi.inviteUserViaEmail(groupId, values.email);

      notificationManager.showSuccess('', response.message);
    } catch (error) {
      if (isAxiosError<ErrorResponse>(error)) {
        notificationManager.showFail('', error.response?.data.message);
      }
    }

    setLoading(false);
    setInviteViaEmailOpened(false);
  };

  return (
    <>
      <Modal
        title="Settings"
        opened={opened}
        onClose={handleCloseModal}
      >
        Settings
      </Modal>
      <Modal
        title="Invitation link"
        opened={invitationModalOpened}
        onClose={handleCloseInvitationModal}
      >
        <TextInput
          value={invitationLink}
          disabled
        />
        <Group position="center" mt="lg">
          <Button onClick={handleCopyInvitationLink}>
            Copy link
          </Button>
        </Group>
      </Modal>
      <Modal
        title="Invite via email"
        opened={inviteViaEmailOpened}
        onClose={handleCloseInviteViaEmailModal}
      >
        <form onSubmit={form.onSubmit(handleSubmitInviteViaEmailForm)}>
          <TextInput
            label="Email"
            placeholder="Email you want invite"
            required
            {...form.getInputProps('email')}
          />
          <Group position="center" mt="lg">
            <Button type="submit" loading={isLoading}>
              Send link
            </Button>
          </Group>
        </form>
      </Modal>
      <Group my="lg" position="apart">
        <Breadcrumbs>
          {breadcrumbsItems.map((item, index) => (
            <Anchor key={index} component={Link} to={item.to}>
              {item.title}
            </Anchor>
          ))}
        </Breadcrumbs>
        <Group>
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <Tooltip label="Invite people">
                <Button>
                  <IconUserPlus />
                </Button>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={handleOpenInvitationModal}>
                Get invitation link
              </Menu.Item>
              <Menu.Item onClick={handleOpenInviteViaEmailModal}>
                Send invitation via email
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Tooltip label="Settings">
            <Button onClick={handleOpenModal}>
              <IconSettings />
            </Button>
          </Tooltip>
        </Group>
      </Group>
    </>
  );
}