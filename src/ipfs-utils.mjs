import IpfsHttpClient from 'ipfs-http-client';
const { urlSource } = IpfsHttpClient;

const ipfs = IpfsHttpClient();

const save2block = async obj => {
  const cid = await ipfs.dag.put(obj, {
    format: 'dag-cbor',
    hashAlg: 'sha2-256',
    pin: true
  });
  return cid;
}

const url2ipfs = async (url) => {
  const ipfs_file = await ipfs.add(urlSource(url));
  return ipfs_file.cid;
}

const safeUnpin = async (cid) => {
  if (cid) {
    await ipfs.pin.rm(cid);
  }
}

export { save2block, url2ipfs, safeUnpin };
