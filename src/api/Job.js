export const postObjectLabel = async (jobId, labelId, data) => {
  const Data = {
    name: data,
  };
  const response = await api.post(
    `/api/v1/jobs/${jobId}/labels/${labelId}/objects`,
    Data
  );
  return response.data;
};
