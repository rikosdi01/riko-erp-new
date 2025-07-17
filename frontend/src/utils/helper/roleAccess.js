const roleAccess = (accessList, accessKey) => {
  return accessList.includes(accessKey);
};

export default roleAccess;