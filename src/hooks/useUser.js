import { useMutation, useQuery } from "@tanstack/react-query";
import { getRefreshToken, getUser, PostLogin } from "../api/User";
// useQuery : Get 계열의 데이터 가져오기 (주로 자동 수행)
// useMutation : POST/PUT/DELETE 계열의 서버 상태를 변경하는 요청 (주로 수동 수행)

export const useUser = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUser,
  });
};

export const usePostLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }) => PostLogin(email, password),
  });
};

export const useGetRefreshToken = (token, hasTriedRefresh) => {
  return useQuery({
    queryKey: ["refreshToken"],
    queryFn: getRefreshToken,
    enabled: !token && hasTriedRefresh === false,
    retry: false,
  });
};
