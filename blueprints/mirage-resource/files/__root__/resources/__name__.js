export default function <%= fixedName %>(server) {
  server.get('/<%= resourceName %>');
  server.get('/<%= resourceName %>/:id');
  server.post('/<%= resourceName %>');
  server.put('/<%= resourceName %>/:id');
  server.patch('/<%= resourceName %>/:id');
  server.del('/<%= resourceName %>/:id');
}
