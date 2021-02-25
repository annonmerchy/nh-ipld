import * as nhentai from 'nhentai';

import { save2block, url2ipfs, safeUnpin } from './ipfs-utils.mjs';

const pinThings = async (metadata) => {
  metadata.cover.cid = await url2ipfs(metadata.cover.url);
  metadata.thumbnail.cid = await url2ipfs(metadata.thumbnail.url);

  for (const page of metadata.pages) {
    if (page.url) {
      page.cid = await url2ipfs(page.url);
    }
  }

  return metadata;
}

const unpinThings = async (metadata) => {
  await safeUnpin(metadata.cover.cid);
  await safeUnpin(metadata.thumbnail.cid);

  await Promise.all(
    metadata.pages.map(page => safeUnpin(page.cid))
  );
}

const tags2iplds = async (metadata) => {
  // TODO
}

const reformatMeta = (metadata) => {
  // Doesn't make sense to store favorite counts
  // when we're working with ipfs
  delete metadata.favorites;

  // API Options are not neccessary either
  delete metadata.apiOptions;

  // Tag count and Tag URLs are unecessary
  metadata.tags.forEach(tag => {
    delete tag.url;
    delete tag.count;
  });

  // Image URLs are no longer needed
  // since the images are on IPFS
  delete metadata.cover.url;
  delete metadata.thumbnail.url;
  metadata.pages.forEach(page => delete page.url);

  return metadata;
}

const nh2ipld = async (sauce) => {
  const nh = new nhentai.API();

  const doujin = await nh.fetchDoujin(sauce);

  // Hacky way of doing a Deep Copy
  let metadata = JSON.parse(JSON.stringify(doujin));

  // Originally tried to copy Date object
  // since JSON deep copy makes it a string
  // but DAG-CBOR breaks on Date objects
  // metadata.uploadDate = doujin.uploadDate;

  let something = undefined;

  try {
    metadata = await pinThings(metadata);
    metadata = reformatMeta(metadata);

    something = await save2block(metadata);
    console.debug(something);
  } catch (error) {
    console.error(error);
  } finally {
    await unpinThings(metadata);
  }

  return something;
}

export { nh2ipld };
