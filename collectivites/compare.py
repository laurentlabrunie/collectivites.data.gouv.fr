from . import addr_utils

class MakeGroupList:

    """ travaille la liste d'origine et génère une liste où sont identifiés les doublons """

    def __init__(self, list_content):
        self.municipality = list_content['name']
        self.citycode = list_content['citycode']
        self.list_groups = list_content['groups']
        self.content_ordered = []
        self.content_complete = {}

    def add_compare_element(self):

        """ prépare les données à comparer

         (non finalisé pour l'instant) """

        for group in self.list_groups:

            addr = addr_utils.AddrGroup(group['name'])
            group['data_to_compare'] = addr.guess_typeof_street + addr.guess_strong_word
            group['message_alert'] = addr_utils.construction_message(addr)

    def compare_groups(self):

        """ compare les voies et génère une nouvelle liste où sont identifiés les différents doublons potentiels :
           pour chaque voie étudiée dans la première liste,
           on la copie d'abord dans la seconde liste
           puis on la supprime dans la première

           Et c'est ensuite que l'on fait la comparaison... """


        nb_groups_before = len(self.list_groups)
        self.num_group = 0

        while len(self.list_groups) != 0:

            """ parent_id = self.list_groups[0]['id'] """
            group = dict()
            group[self.num_group] = self.list_groups[0]
            data_to_compare = group[self.num_group]['data_to_compare']
            self.num_group += 1

            del self.list_groups[0]
            self.content_ordered.append(self.compare_one_group_to_others(group, data_to_compare))

        nb_groups_after = self.num_group

        if nb_groups_before != nb_groups_after:
            raise ValueError('Fonction "compare_groups" : le nombre de voie est différent avant '
                                'et après le traitement : Avant <' + str(nb_groups_before) + '> '
                                'et Après <' + str(nb_groups_after) + '>')

    def compare_one_group_to_others(self, group, data_to_compare):

        """ ...compare la dernière voie de la seconde liste avec toutes les autres voies de la première
           et identifie les doublons...

           ...puis copie ces doublons à la suite de la voie comparée, et les supprime dans la première liste. """

        index_group = 0
        nb_group = len(self.list_groups)
        length = 1

        while nb_group > index_group:
            if self.list_groups[index_group]['data_to_compare'] == data_to_compare:
                group[self.num_group] = self.list_groups[index_group]
                del self.list_groups[index_group]
                nb_group -= 1
                self.num_group += 1
                length += 1
            else:
                index_group += 1

        group['length'] = length
        return group

    def add_municipality(self):

        """ met en forme le dictionnaire avec les données à faire passer en plus des voies """

        self.content_complete['name'] = self.municipality
        self.content_complete['citycode'] = self.citycode
        self.content_complete['groups'] = self.content_ordered

    def create_content_complete(self):

        """ fonction qui lance le traitement

         et renvoie le dictionnaire correctement organisé """

        self.add_compare_element()
        self.compare_groups()
        self.add_municipality()
        return self.content_complete