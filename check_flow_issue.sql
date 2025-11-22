-- Find the "Anwesh Soumi halve lives" flow
SELECT 
    id,
    name,
    type,
    category,
    configurations
FROM inbx_ai_flows
WHERE LOWER(name) LIKE '%anwesh%' OR LOWER(name) LIKE '%soumi%' OR LOWER(name) LIKE '%half%' OR LOWER(name) LIKE '%halve%'
ORDER BY created_at DESC;

