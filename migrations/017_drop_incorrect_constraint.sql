ALTER TABLE swap_pool_tags
DROP CONSTRAINT IF EXISTS swap_pool_tags_swap_pool_fkey;

DELETE FROM swap_pool_tags
WHERE
    swap_pool NOT IN(
        SELECT id
        FROM swap_pools
    );

ALTER TABLE swap_pool_tags
ADD CONSTRAINT swap_pool_tags_swap_pool_fkey FOREIGN KEY (swap_pool) REFERENCES swap_pools (id);