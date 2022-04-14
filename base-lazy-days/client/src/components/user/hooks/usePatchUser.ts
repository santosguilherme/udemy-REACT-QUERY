import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) {
    return null;
  }

  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );

  return data.user;
}

export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    (newUser: User) => patchUserOnServer(newUser, user),
    {
      // OnMutate returns context that is passed to onError
      onMutate: async (newUser: User | null) => {
        queryClient.cancelQueries([queryKeys.user]);

        const previousUserData: User = queryClient.getQueryData(queryKeys.user);

        updateUser(newUser);

        return { previousUserData };
      },
      onError: (error, newData, context) => {
        if (!context) {
          return;
        }

        updateUser(context.previousUserData);
        toast({
          title: 'Update failed, restoring previous value',
          status: 'warning',
        });
      },
      onSuccess: (userData: User | null) => {
        if (!user) {
          return;
        }

        updateUser(userData);
        toast({
          title: 'User updated!',
          status: 'success',
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  return mutate;
}
